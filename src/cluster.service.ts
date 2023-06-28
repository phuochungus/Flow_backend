import { Injectable } from '@nestjs/common';

import cluster from 'cluster';
import os from 'os';

const numCPUs = os.cpus().length;

@Injectable()
export class ClusterService {
  static clusterize(callback: Function): void {
    if (cluster.isPrimary) {
      console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);
      console.log(numCPUs);

      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
        // cluster.fork();
      });
    } else {
      console.log(`Cluster server started on ${process.pid}`);
      callback();
    }
  }
}
