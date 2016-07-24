const express = require("express");
const osc = require("osc");

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));

const port = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 57121
});

port.open();

const fields = {
    "button-1": {
        type: "button",
        value: 0
    },
    "button-2": {
        type: "button",
        value: 0
    },
    "slider-1": {
        type: "slider",
        value: 0
    },
    "slider-2": {
        type: "slider",
        value: 0
    }
};

function update(id) {
    io.sockets.emit("update", {id, value: fields[id].value});

    port.send({
        address: "/" + id,
        args: [fields[id].value]
    }, "127.0.0.1", 12000);
}

io.on("connection", function(socket) {
	socket.on("button", function(id) {
        console.log(id);

        if(fields[id] && fields[id].type == "button") {
            fields[id].value = !fields[id].value;
            update(id);
        }
	});

    socket.on("slider", function(data) {
        console.log(data);

        if(fields[data.id] && fields[data.id].type == "slider" && data.value >= 0 && data.value <= 1) {
            fields[data.id].value = data.value;
            update(data.id);
        }
    });
});


server.listen(8080);
