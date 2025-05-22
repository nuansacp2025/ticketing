export class Mutex {
    private _locked: boolean = false;
    private _waiting: Array<() => void> = [];

    lock(): Promise<void> {
        if (!this._locked) {
            this._locked = true;
            return Promise.resolve();
        }
        return new Promise(resolve => {
            this._waiting.push(() => {
                this._locked = true;
                resolve();
            });
        });
    }

    unlock(): void {
        if (!this._locked) {
            throw new Error('Mutex is not locked');
        }
        if (this._waiting.length > 0) {
            const next = this._waiting.shift();
            if (next) next();
        } else {
            this._locked = false;
        }
    }

    async withLock<T>(fn: () => Promise<T> | T): Promise<T> {
        await this.lock();
        try {
            return await fn();
        } finally {
            this.unlock();
        }
    }
}