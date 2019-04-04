const { Cert } = require('@0xcert/cert')
const { schema88 } = require('@0xcert/conventions')

const cert = new Cert({
    schema: {
        image_url: 'wat'
    },
});

console.log(cert)