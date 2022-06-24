const fs = require("fs")
const path = require("path")
const http = require("http")
const url = require("url")
const { StringDecoder } = require("string_decoder")
const decoder = new StringDecoder()

const fullPath = path.join(__dirname, "/data")
const server = http.createServer((req, res) => {
	if (req.method === "POST") {
		let data = ""

		req.on("data", (chunk) => {
			data += decoder.write(chunk)
		})
		req.on("end", () => {
			console.log(data)
			writeFile(req.url, req.headers.filename, data, (err) => {
				if (err) {
					res.end("There was an error writing to file")
				} else {
					res.end("File written successfully")
				}
			})
		})
	}

	if (req.method === "GET") {
		const parsedURl = url.parse(req.url, true)
		const path = parsedURl.pathname
		const trimmedUrl = path.replace(/^\/+|\/+$/g, "")
		const dirName = "/" + trimmedUrl.split("/")[0]
		const fileName = trimmedUrl.split("/")[1] + ".json"
		console.log(trimmedUrl, dirName, fileName)
		const isExistFile = fs.existsSync(fullPath + dirName + "/" + fileName)
		if (isExistFile) {
			const createReadStream = fs.createReadStream(
				fullPath + dirName + "/" + fileName
			)
			let responsData = ""
			createReadStream.on("data", (chunk) => {
				responsData += decoder.write(chunk)
			})
			createReadStream.on("end", () => {
				res.end(responsData)
			})
		} else {
			res.end(fullPath + dirName + "/" + fileName + "path not found")
		}
	}
})

server.listen(4000, () => {
	console.log("server is running on port " + 4000)
})

const writeFile = (subFolder, fileName, data, callback) => {
	console.log(subFolder)
	fs.promises.mkdir(fullPath + subFolder, { recursive: true })
	fs.open(
		fullPath + subFolder + "/" + fileName + ".json",
		"wx",
		(err, fd) => {
			if (err) {
				callback("file already exists")
			} else {
				fs.writeFile(fd, data, (err) => {
					callback(err)
				})
			}
		}
	)
}
