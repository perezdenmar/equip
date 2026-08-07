async function test() {
    const moduleToTest = process.argv[2];
    console.log(`Testing import: ${moduleToTest}`);
    try {
        const start = Date.now();
        await import(moduleToTest);
        console.log(`Import successful (${Date.now() - start}ms)`);
    } catch (err) {
        console.error(`Import failed:`, err);
    }
}

test();
