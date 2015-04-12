var request  = require('request'),
    temporal = require("temporal"),
    repl     = require("repl"),
    params   = {
        access_token : process.env.SPARK_TOKEN
    };

/// SYNCHRONIZE
//  Turn lights off
//  Wait 20s
//  Turn lights on
//  Wait 12s
//  Turn lights off
//  Wait 7s
//  Turn lights on
//  Treasure Island

/// MOVE ONE POSITION
//  1. Lights are already on
//      Turn lights off
//      Wait 1.5s
//      Turn lights on
//  2. Lights are off
//      Turn lights on
//      Wait 20s
//      Turn lights off
//      Wait 1.5s
//      Turn lights on

/// COLOR MODES
//  1. Treasure Island / Slow color change
//  2. Moonlight White / Fixed White
//  3. SAVI Blue / Fixed Blue
//  4. Sargasso Sea / Fixed Green
//  5. Blue Lagoon / Fixed Light Blue
//  6. Passion Pink / Fixed Magenta
//  7. Caribbean Hues / Blue and Green Slow Color Change
//  8. Copacabana / Magenta, Yellow and Orange Slow Color Change
//  9. Dance party / Multi Color Strobe Effect

function sync () {
    request.post(
        'https://api.spark.io/v1/devices/' + process.env.SPARK_DEVICE_ID + '/sync',
        {
            timeout: 60000,
            form: {
                access_token : process.env.SPARK_TOKEN
            }
        },
        handleResponse.bind(this)
    );
}

function handleResponse (err, res, body) {
    if (err) {
        console.log(err);
    } else {
        console.log(body);
    }
}

var replDefaults = {
    prompt: ">> ",
    useGlobal: false
};

// Initialize the REPL session with the default
// repl settings.
// Assign the returned repl instance to "cmd"
var cmd = repl.start(replDefaults);

cmd.context.sync = sync;
