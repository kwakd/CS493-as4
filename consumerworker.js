const amqp = require('amqplib')

const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost'
const rabbitmqUrl = `amqp://${rabbitmqHost}`

const { getDownloadStreamById, updateImageTagsById } = require('./models/image');

const sizeOf = require('image-size');


exports.consumerworker = async function () {
    const connection = await amqp.connect(rabbitmqUrl)
    const channel = await connection.createChannel()
    await channel.assertQueue('echo')

    channel.consume('echo', async function (msg) {
        if (msg) {
            const id = msg.content.toString();
            console.log(id)
            const downloadStream = await getDownloadStreamById(id);

            const imageData = [];
            downloadStream.on('data', (data) => {
                imageData.push(data);
            });
            downloadStream.on('end', async () => {
                const dimensions = sizeOf(Buffer.concat(imageData));
                const result = await updateImageTagsById(id, dimensions);
            });
        }
        channel.ack(msg)
    })
}
