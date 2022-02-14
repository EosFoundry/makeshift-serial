process.send({
    message: "child first message is this the"
})

setInterval(() => {
    console.log('Process child: ping!');
    process.send({
        message: "this is a child from the object process"
    });
}, 5000);
