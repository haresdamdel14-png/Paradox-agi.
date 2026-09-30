export interface AudioRecordingResult {
  blob: Blob;
  base64: string;
  mimeType: string;
  duration: number;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime = 0;
  private timerInterval: any = null;
  private onTimeUpdate?: (seconds: number) => void;
  private mimeType = 'audio/webm';

  public isRecording = false;

  async start(onTimeUpdate?: (seconds: number) => void): Promise<void> {
    this.onTimeUpdate = onTimeUpdate;
    this.audioChunks = [];

    // Choose supported MIME type
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      this.mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      this.mimeType = 'audio/webm';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      this.mimeType = 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      this.mimeType = 'audio/ogg;codecs=opus';
    } else {
      this.mimeType = 'audio/webm';
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.mimeType,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(200); // 200ms slices
      this.startTime = Date.now();
      this.isRecording = true;

      this.timerInterval = setInterval(() => {
        if (this.onTimeUpdate) {
          const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
          this.onTimeUpdate(elapsed);
        }
      }, 500);
    } catch (err) {
      this.cleanup();
      throw err;
    }
  }

  stop(): Promise<AudioRecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        return reject(new Error('Recorder is not active'));
      }

      const duration = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));

      this.mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(this.audioChunks, { type: this.mimeType });
          const base64 = await this.blobToBase64(blob);
          this.cleanup();
          resolve({
            blob,
            base64,
            mimeType: this.mimeType.split(';')[0],
            duration,
          });
        } catch (e) {
          this.cleanup();
          reject(e);
        }
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.cleanup();
        reject(e);
      }
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.isRecording = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip data:audio/xyz;base64, prefix
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
