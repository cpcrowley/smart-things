const lib = require('./lib.js');

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------

//*-----------------------------------------------------------------------------
//*-----------------------------------------------------------------------------
async function main() {
    await lib.init();
    //await lib.turnBackLampOffAndOn();
    await lib.checkDoorsAndWindows();
}

main()