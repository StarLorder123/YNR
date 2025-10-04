type Task<T> = () => Promise<T>;

export class TaskQueue {
    private queue: Task<any>[] = [];
    private running = false;

    enqueue<T>(task: Task<T>) {
        this.queue.push(task);
        this.run();
    }

    private async run() {
        if (this.running) return;
        this.running = true;
        try {
            while (this.queue.length > 0) {
                const task = this.queue.shift()!;
                try {
                    await task();
                } catch (_) {
                    // 吞掉任务异常，继续后续任务
                }
            }
        } finally {
            this.running = false;
        }
    }
}


