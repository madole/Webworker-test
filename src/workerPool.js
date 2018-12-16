class WorkerPool {
  poolIds = [];
  pool = {};

  constructor(worker, numberOfWorkers) {
    this.worker = worker;
    this.numberOfWorkers = numberOfWorkers;
    for (let i = 0; i < this.numberOfWorkers; i++) {
      this.poolIds.push(i);
      const myWorker = new Worker(worker);

      myWorker.addEventListener("message", e => {
        const data = e.data;
        console.log("Worker #" + i + " finished. status: " + data.status);
        this.pool[i].status = true;
        this.poolIds.push(i);
      });

      this.pool[i] = { status: true, worker: myWorker };
    }
  }

  getFreeWorkerId = callback => {
    console.log(this.poolIds);
    if (this.poolIds.length > 0) {
      return callback(this.poolIds.pop());
    } else {
      setTimeout(() => {
        this.getFreeWorkerId(callback);
      }, 100);
    }
  };

  postMessage = data => {
    this.getFreeWorkerId(workerId => {
      this.pool[workerId].status = false;
      const worker = this.pool[workerId].worker;
      console.log("postMessage with worker #" + workerId);
      worker.postMessage(data);
    });
  };

  registerOnMessage = callback => {
    console.log("Registering on message");
    for (var i = 0; i < this.numberOfWorkers; i++) {
      this.pool[i].worker.addEventListener("message", callback);
    }
  };

  getFreeIds = () => {
    return this.poolIds;
  };
}

export default WorkerPool;
