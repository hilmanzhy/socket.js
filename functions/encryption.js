"use strict";

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateKeyPair } = require('crypto');

exports.signature = function (val) {
	const key = crypto.createCipher(process.env.CRYPTO_SIGNATURE_CIPHER, process.env.CRYPTO_SIGNATURE_PASSWORD);
	var encrypted = key.update(String(val), process.env.CRYPTO_SIGNATURE_ENCODING, process.env.CRYPTO_SIGNATURE_OUTPUT);
	encrypted += key.final(process.env.CRYPTO_SIGNATURE_OUTPUT);

	return encrypted;
};

exports.encrypt = function (val) {
	// const signature = module.exports.signature(val);
	// const valFormat = String(val) + '[separator]' + signature;
	const valFormat = String(val);
	const key = crypto.createCipher(process.env.CRYPTO_CIPHER, process.env.CRYPTO_PASSWORD);
	var encrypted = key.update(valFormat, process.env.CRYPTO_ENCODING, process.env.CRYPTO_OUTPUT);
	encrypted += key.final(process.env.CRYPTO_OUTPUT);

	return encrypted;
};

exports.decrypt = function (encrypted) {
	const key = crypto.createDecipher(process.env.CRYPTO_CIPHER, process.env.CRYPTO_PASSWORD);
	var decrypted = key.update(encrypted, process.env.CRYPTO_OUTPUT, process.env.CRYPTO_ENCODING)
	decrypted += key.final(process.env.CRYPTO_ENCODING);

	return decrypted;
};

exports.extract = function (encrypted) {
	const decrypted = module.exports.decrypt(encrypted);
	const extracted = decrypted.split('[separator]');

	return extracted;
};

exports.validate = function (encrypted) {
	const extracted = module.exports.extract(encrypted);
	let a = [];
	a[0] = extracted[0] || null;
	a[1] = extracted[1] || null;

	if (module.exports.signature(a[0]) !== a[1]) return false;

	return a[0];
};

exports.token = function () {
	return crypto.randomBytes(16).toString('hex');
}

exports.encryptRSA = function (toEncrypt) {
	var encrypted, defaultLength = 470,
		strEncrypt = JSON.stringify(toEncrypt);

	try {
		let keys = {
			public: fs.readFileSync(path.resolve('./storage/keys', 'public.pem'), "utf8"),
			private: fs.readFileSync(path.resolve('./storage/keys', 'private.pem'), "utf8")
		}
		var buffer = Buffer.from(strEncrypt),
			byteLength = Buffer.byteLength(buffer);

		if (byteLength > defaultLength) {
			let encrypting, encrypted = [],
				interval = byteLength / defaultLength;

			for (let i = 0; i < interval; i++) {
				var start = (i * defaultLength),
					end = start + defaultLength,
					sliced = buffer.slice(start, end);

				encrypting = crypto.publicEncrypt(keys.public, sliced)
				encrypted.push(encrypting.toString('base64'))
			}			

			return encrypted;
		} else {
			encrypted = crypto.publicEncrypt(keys.public, buffer);
			
			return encrypted.toString('base64');
		}
	} catch (error) {
		console.log(error)
		throw (error);
	}
}

exports.decryptRSA = function (toDecrypt) {
	try {
		let keys = {
			public: fs.readFileSync(path.resolve('./storage/keys', 'public.pem'), "utf8"),
			private: fs.readFileSync(path.resolve('./storage/keys', 'private.pem'), "utf8")
		}
		var buffer = Buffer.from(toDecrypt, 'base64'),
			decrypted = crypto.privateDecrypt(keys.private, buffer);

			return JSON.parse(decrypted.toString('utf8'));
			
	} catch (error) {		
		return decrypted.toString('utf8');
	}
}