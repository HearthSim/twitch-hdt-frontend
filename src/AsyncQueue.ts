type Listener<T> = (data: T) => void;

export default class AsyncQueue<T extends {}> {
	protected _delay: number;
	queue: { message: T; time: number }[];
	listeners: Listener<T>[];

	constructor(frequency?: number) {
		this.queue = [];
		this.listeners = [];
		this.delay = Infinity;
		setInterval(this._work, frequency || 300);
	}

	set delay(seconds: number) {
		this._delay = seconds * 1000;
		this._work();
	}

	get delay() {
		return this._delay;
	}

	write(data: T, time?: number) {
		this.queue.push({
			message: data,
			time: time || new Date().getTime(),
		});
	}

	listen(listener: Listener<T>): void {
		this.listeners.push(listener);
	}

	unlisten(listener: Listener<T>): void {
		this.listeners.filter(l => l === listener);
	}

	protected _work(): void {
		const cutoff = new Date().getTime() - this.delay;
		while (this.queue.length && this.queue[0].time < cutoff) {
			const e = this.queue.shift();
			e && this._emit(e.message);
		}
	}

	protected _emit(data: T): void {
		this.listeners.forEach(l => l(data));
	}
}
