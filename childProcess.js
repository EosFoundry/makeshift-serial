process.send({
    message: "this is the first child message"
})

setInterval(() => {
    console.log('Child process: ping!');
    process.send({
        message: "this is an object from the child process"
    });
}, 1000);
