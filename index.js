var request  = require('request');
var temporal = require('temporal');
var repl = require('repl');
var spark = require('spark');
var chalk = require('chalk');
var events = require('events');
var emitter = new events.EventEmitter();

var modes = [
    'Treasure Island / Slow color change',
    'Moonlight White / Fixed White',
    'SAVI Blue / Fixed Blue',
    'Sargasso Sea / Fixed Green',
    'Blue Lagoon / Fixed Light Blue',
    'Passion Pink / Fixed Magenta',
    'Caribbean Hues / Blue and Green Slow Color Change',
    'Copacabana / Magenta, Yellow and Orange Slow Color Change',
    'Dance party / Multi Color Strobe Effect'
];

var state = {
    device: null,
    synced: true,
    changing: false,
    mode: null
};

spark.login({accessToken: '86d2ecbb912ec707949d7effa0eafad97f16c637'}, function () {

    console.log(chalk.cyan('Successfully logged in.'));

});

spark.on('login', function(err, body) {
    if (err) {
        console.log(chalk.red('Couldn\'t log in.'));
    } else {
        console.log(chalk.cyan('Successfully logged in.'));
    }
});

spark.getDevice('54ff6f066678574932290167', function(err, device) {
    console.log('Device ready: ' + chalk.green(device.name));
    state.device = device;

    if (!state.synced) {
        device.callFunction('sync', null, function(err, data) {
            // This is going to time out so don't even worry about it
        });

        device.subscribe('synchronizing', function(data) {
            console.log(chalk.yellow('Syncing...'));
        });

        device.subscribe('synchronized', function(data) {
            console.log(chalk.green('Done syncing.'));
            state.synced = true;
            state.mode = 0;
            emitter.emit('ready');
        });
    } else {
        state.mode = 0;
        emitter.emit('ready');
    }
});

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

emitter.on('ready', function () {

    if (!state.device || !state.synced) {
        console.log(chalk.red('Hm, something went wrong.'));
        return;
    }

    console.log(chalk.magenta('Ready to change some colors!'));

    console.log(chalk.cyan('Color mode:'), modes[state.mode]);

    state.device.subscribe('change-start', function(data) {
        console.log(chalk.yellow('Changing...'));
        state.changing = true;
    });

    state.device.subscribe('changed', function(data) {
        console.log(chalk.cyan('Moved 1 step.'));
        if (state.mode === modes.length - 1) {
            state.mode = 0;
        } else {
            state.mode++;
        }
        console.log(chalk.cyan('Color mode:'), modes[state.mode]);
    });

    state.device.subscribe('change-end', function(data) {
        console.log(chalk.green('Done changing.'));
        state.changing = false;
    });

    next();

});

function next () {

    if (state.changing) {
        console.log(chalk.red('Device is busy. Try again later.'));
        return;
    }

    state.device.callFunction('next', null, function(err, data) {
        // This is going to time out so don't even worry about it
    });

}

function moveSteps(steps) {
    if (state.changing) {
        console.log(chalk.red('Device is busy. Try again later.'));
        return;
    }

    state.device.callFunction('moveSteps', steps.toString(), null, function(err, data) {
        // This is going to time out so don't even worry about it
    });
}

var replDefaults = {
    prompt: 'what? ',
    useGlobal: false
};

// Initialize the REPL session with the default
// repl settings.
// Assign the returned repl instance to 'cmd'
var cmd = repl.start(replDefaults);

cmd.context.next = next;
cmd.context.moveSteps = moveSteps;
