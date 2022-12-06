

class LiveUpdate {

    static FALLBACK_INTERVAL_TIME = 2000;

    #worker;

    #callback;

    #fallbackInterval;

    constructor(workerUrl) {

        // Check if the client browser supports the Worker API
        if (window.Worker) {

            // Create the worker
            this.#worker = new Worker(workerUrl);

            // Setup the listener for messages from the worker
            this.#worker.onmessage = e => {
                switch (e.data.message) {
                    case 'update':
                        if (this.#callback)
                            this.#callback(e.data.response);
                        break;
                    case 'stopped':
                        // If you're not going to use the Worker anymore after it
                        // has been stopped, this is a good place to terminate it
                        this.#worker.terminate();
                        break;
                }
            };
        }
    }

    start(method, url, callback) {

        this.#callback = callback;

        // If we have a Worker, it means the
        // client browser supports the Worker API
        if (this.#worker) {

            // Start our Worker!
            this.#worker.postMessage({
                message: 'start',
                method: method,
                url: url
            });

        } else {

            // Fallback to running the live update without the Worker
            this.#fallbackInterval = setInterval(() => {

                // Here we can use fetch!
                fetch(url, { method: method })
                    .then(response => response.json())
                    .then(result => {
                        if (this.#callback)
                            this.#callback(result);
                    });

            }, LiveUpdate.LOCAL_INTERVAL_TIME);

        }

    }

    stop() {

        if (this.#worker) {

            // If we have a worker, send it a request
            // to stop the live update loop
            this.#worker.postMessage({
                message: 'stop'
            });

        } else if (this.#fallbackInterval) {

            // Stop our fallback interval
            clearInterval(this.#fallbackInterval);
            this.#fallbackInterval = 0;

        }

    }


}



// --- Use case

// Create the LiveUpdate object with the URL of our Worker script file
const liveUpdate = new LiveUpdate('https://www.example.com/path/to/live-update-worker.js')

// Start the live update loop
// Arguments:
// 1. HTTP Method
// 2. URL to the server endpoint
// 3. Callback for the JSON response from the server
liveUpdate.start('GET', 'https://www.example.com/path/to/server/data', (response) => {

    // Here we can do whatever we want with the callback!
    // Let's just log it to see that it works
    console.log(response);

});

// --- Later in the code...

// Stop the live update loop
liveUpdate.stop();