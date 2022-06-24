/*
    Author: Samiul Basir Fahim
    Title: handle server
    Description: server handle function here
    Date: jun 24, 2022
*/

// Importing the necessary modules
const url = require("url")
const { StringDecoder } = require("string_decoder")
const fs = require("fs")
const http = require("http")
const path = require("path")

// codes for handling the server
const handleServer = (req, res) => {
	const parsedUrl = url.parse(req.url)
	const pathWithSlashes = parsedUrl.pathname
	const path = pathWithSlashes.replace(/^\/|\/$/g, "")
	let body = ""
	const query = parsedUrl.query
	const decoder = new StringDecoder("utf-8")
	const method = req.method.toLowerCase()
	req.on("data", (chunkOfBuffer) => {
		body += decoder.write(chunkOfBuffer)
	})

	if (method === "post" && path === "add") {
		req.on("end", () => {
			if (!fs.existsSync("data.txt")) {
				fs.writeFile("data.txt", body, (err) => {
					if (err) {
						res.write(`\nError: ${err}`)
						res.end(`\nEnd of request`)
					} else {
						res.write(`\nData added successfully`)
						res.end(`\nEnd of request`)
					}
				})
			} else {
				fs.appendFile("data.txt", `\n${body}`, (err) => {
					if (err) {
						res.write(`\nError: ${err}`)
						res.end(`\nEnd of request`)
					} else {
						res.write(`\nData added successfully`)
						res.end(`\nEnd of request`)
					}
				})
			}
		})
	} else if (method === "get" && path === "read") {
		const dataStream = fs.createReadStream(__dirname + "/data.txt")
		dataStream.on("data", (chunkOfBuffer) => {
			res.write(decoder.write(chunkOfBuffer))
			res.end()
		})
	}
}

http.createServer(handleServer).listen(4000, () => {
	console.log("Server is running on port 4000")
})

