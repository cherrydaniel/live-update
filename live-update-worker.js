
class LiveUpdateWorker {

    static WORKER_INTERVAL_TIME = 500;

    interval;

    beginUpdateLoop(data) {

        // Save a reference to the interval so we can stop it later
        this.interval = setInterval(() => {

            // Ahh.. the good old XMLHttpRequest
            const request = new XMLHttpRequest();
            request.onreadystatechange = () => {

                // We got a response from the server
                if (request.readyState === 4) {

                    // If there's no new data, just skip this iteration
                    if (!request.responseText) return;

                    // We got new data! Convert it to JSON
                    const result = JSON.parse(request.responseText);

                    // Notify our main code with the new data from the server
                    postMessage({
                        message: 'update',
                        response: result
                    });

                }
            };
            request.open(data.method, data.url, true);
            request.send();


        }, LiveUpdateWorker.WORKER_INTERVAL_TIME);

    }

    stopUpdateLoop() {

        // If there's no interval, there's nothing to stop
        if (!this.interval) return;

        // Stop the live update loop
        clearInterval(this.interval);

        // Reset the interval field
        this.interval = 0;

        // Nofity our main code that the loop has been stopped
        postMessage({ message: 'stopped' });

    }

}


// Create an instance of our helper class
const liveUpdateWorker = new LiveUpdateWorker();

// Register a listener for messages from our main code
onmessage = e => {

    switch (e.data.message) {
        case 'start':
            liveUpdateWorker.beginUpdateLoop(e.data);
            break;
        case 'stop':
            liveUpdateWorker.stopUpdateLoop();
            break;
    }

};