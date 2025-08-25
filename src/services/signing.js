"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getP12FromLocalFile = getP12FromLocalFile;
exports.getP12FromUrl = getP12FromUrl;
exports.getXMLFromLocalFile = getXMLFromLocalFile;
exports.getXMLFromLocalUrl = getXMLFromLocalUrl;
exports.signXml = signXml;
var forge = require("node-forge");
var fs_1 = require("fs");
var node_fetch_1 = require("node-fetch");
function getP12FromLocalFile(path) {
    var file = (0, fs_1.readFileSync)(path);
    var buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
    return buffer;
}
function getP12FromUrl(url) {
    return __awaiter(this, void 0, void 0, function () {
        var file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, node_fetch_1.default)(url)
                        .then(function (response) { return response.arrayBuffer(); })
                        .then(function (data) { return data; })];
                case 1:
                    file = _a.sent();
                    return [2 /*return*/, file];
            }
        });
    });
}
function getXMLFromLocalFile(path) {
    var file = (0, fs_1.readFileSync)(path, "utf8");
    return file;
}
function getXMLFromLocalUrl(url) {
    return __awaiter(this, void 0, void 0, function () {
        var file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, node_fetch_1.default)(url)
                        .then(function (response) { return response.text(); })
                        .then(function (data) { return data; })];
                case 1:
                    file = _a.sent();
                    return [2 /*return*/, file];
            }
        });
    });
}
function sha1Base64(text, encoding) {
    if (encoding === void 0) { encoding = "utf8"; }
    var md = forge.md.sha1.create();
    md.update(text, encoding);
    var hash = md.digest().toHex();
    var buffer = Buffer.from(hash, "hex");
    var base64 = buffer.toString("base64");
    return base64;
}
function hexToBase64(hex) {
    hex = hex.padStart(hex.length + (hex.length % 2), "0");
    var bytes = hex.match(/.{2}/g).map(function (byte) { return parseInt(byte, 16); });
    return btoa(String.fromCharCode.apply(String, bytes));
}
function bigIntToBase64(bigInt) {
    var hex = bigInt.toString(16);
    var hexPairs = hex.match(/\w{2}/g);
    var bytes = hexPairs.map(function (pair) { return parseInt(pair, 16); });
    var byteString = String.fromCharCode.apply(String, bytes);
    var base64 = btoa(byteString);
    var formatedBase64 = base64.match(/.{1,76}/g).join("\n");
    return formatedBase64;
}
function getRandomNumber(min, max) {
    if (min === void 0) { min = 990; }
    if (max === void 0) { max = 9999; }
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function signXml(p12Data, p12Password, xmlData) {
    return __awaiter(this, void 0, void 0, function () {
        var arrayBuffer, xml, arrayUint8, base64, der, asn1, p12, pkcs8Bags, certBags, certBag, friendlyName, certificate, pkcs8, issuerName, cert, issueAttributes, keys, i, element, name_1, notBefore, notAfter, date, key, certificateX509_pem, certificateX509, certificateX509_asn1, certificateX509_der, hash_certificateX509_der, certificateX509_serialNumber, exponent, modulus, sha1_xml, nameSpaces, certificateNumber, signatureNumber, signedPropertiesNumber, signedInfoNumber, signedPropertiesIdNumber, referenceIdNumber, signatureValueNumber, objectNumber, isoDateTime, signedProperties, sha1SignedProperties, keyInfo, sha1KeyInfo, signedInfo, canonicalizedSignedInfo, md, signature, xadesBes;
        var _a;
        return __generator(this, function (_b) {
            arrayBuffer = p12Data;
            xml = xmlData;
            xml = xml.replace(/\s+/g, " ");
            xml = xml.trim();
            xml = xml.replace(/(?<=\>)(\r?\n)|(\r?\n)(?=\<\/)/g, "");
            xml = xml.trim();
            xml = xml.replace(/(?<=\>)(\s*)/g, "");
            arrayUint8 = new Uint8Array(arrayBuffer);
            base64 = forge.util.binary.base64.encode(arrayUint8);
            der = forge.util.decode64(base64);
            asn1 = forge.asn1.fromDer(der);
            p12 = forge.pkcs12.pkcs12FromAsn1(asn1, p12Password);
            pkcs8Bags = p12.getBags({
                bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
            });
            certBags = p12.getBags({
                bagType: forge.pki.oids.certBag,
            });
            certBag = certBags[forge.oids.certBag];
            friendlyName = certBag[1].attributes.friendlyName[0];
            issuerName = "";
            cert = certBag.reduce(function (prev, curr) {
                var attributes = curr.cert.extensions;
                return attributes.length > prev.cert.extensions.length ? curr : prev;
            });
            issueAttributes = cert.cert.issuer.attributes;
            issuerName = issueAttributes
                .reverse()
                .map(function (attribute) {
                return "".concat(attribute.shortName, "=").concat(attribute.value);
            })
                .join(", ");
            if (/BANCO CENTRAL/i.test(friendlyName)) {
                keys = pkcs8Bags[forge.oids.pkcs8ShroudedKeyBag];
                for (i = 0; i < keys.length; i++) {
                    element = keys[i];
                    name_1 = element.attributes.friendlyName[0];
                    if (/Signing Key/i.test(name_1)) {
                        pkcs8 = pkcs8Bags[forge.oids.pkcs8ShroudedKeyBag[i]];
                    }
                }
            }
            if (/SECURITY DATA/i.test(friendlyName)) {
                pkcs8 = pkcs8Bags[forge.oids.pkcs8ShroudedKeyBag][0];
            }
            certificate = cert.cert;
            notBefore = certificate.validity["notBefore"];
            notAfter = certificate.validity["notAfter"];
            date = new Date();
            if (date < notBefore || date > notAfter) {
                throw new Error("Expired certificate");
            }
            key = (_a = pkcs8.key) !== null && _a !== void 0 ? _a : pkcs8.asn1;
            certificateX509_pem = forge.pki.certificateToPem(certificate);
            certificateX509 = certificateX509_pem;
            certificateX509 = certificateX509.substr(certificateX509.indexOf("\n"));
            certificateX509 = certificateX509.substr(0, certificateX509.indexOf("\n-----END CERTIFICATE-----"));
            certificateX509 = certificateX509
                .replace(/\r?\n|\r/g, "")
                .replace(/([^\0]{76})/g, "$1\n");
            certificateX509_asn1 = forge.pki.certificateToAsn1(certificate);
            certificateX509_der = forge.asn1.toDer(certificateX509_asn1).getBytes();
            hash_certificateX509_der = sha1Base64(certificateX509_der, "utf8");
            certificateX509_serialNumber = parseInt(certificate.serialNumber, 16);
            exponent = hexToBase64(key.e.data[0].toString(16));
            modulus = bigIntToBase64(key.n);
            xml = xml.replace(/\t|\r/g, "");
            sha1_xml = sha1Base64(xml.replace('<?xml version="1.0" encoding="UTF-8"?>', ""), "utf8");
            nameSpaces = 'xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#"';
            certificateNumber = getRandomNumber();
            signatureNumber = getRandomNumber();
            signedPropertiesNumber = getRandomNumber();
            signedInfoNumber = getRandomNumber();
            signedPropertiesIdNumber = getRandomNumber();
            referenceIdNumber = getRandomNumber();
            signatureValueNumber = getRandomNumber();
            objectNumber = getRandomNumber();
            isoDateTime = date.toISOString().slice(0, 19);
            signedProperties = "";
            signedProperties +=
                '<etsi:SignedProperties Id="Signature' +
                    signatureNumber +
                    "-SignedProperties" +
                    signedPropertiesNumber +
                    '">';
            signedProperties += "<etsi:SignedSignatureProperties>";
            signedProperties += "<etsi:SigningTime>";
            signedProperties += isoDateTime;
            signedProperties += "</etsi:SigningTime>";
            signedProperties += "<etsi:SigningCertificate>";
            signedProperties += "<etsi:Cert>";
            signedProperties += "<etsi:CertDigest>";
            signedProperties +=
                '<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
            signedProperties += "</ds:DigestMethod>";
            signedProperties += "<ds:DigestValue>";
            signedProperties += hash_certificateX509_der;
            signedProperties += "</ds:DigestValue>";
            signedProperties += "</etsi:CertDigest>";
            signedProperties += "<etsi:IssuerSerial>";
            signedProperties += "<ds:X509IssuerName>";
            signedProperties += issuerName;
            signedProperties += "</ds:X509IssuerName>";
            signedProperties += "<ds:X509SerialNumber>";
            signedProperties += certificateX509_serialNumber;
            signedProperties += "</ds:X509SerialNumber>";
            signedProperties += "</etsi:IssuerSerial>";
            signedProperties += "</etsi:Cert>";
            signedProperties += "</etsi:SigningCertificate>";
            signedProperties += "</etsi:SignedSignatureProperties>";
            signedProperties += "<etsi:SignedDataObjectProperties>";
            signedProperties +=
                '<etsi:DataObjectFormat ObjectReference="#Reference-ID=' +
                    referenceIdNumber +
                    '">';
            signedProperties += "<etsi:Description>";
            signedProperties += "contenido comprobante";
            signedProperties += "</etsi:Description>";
            signedProperties += "<etsi:MimeType>";
            signedProperties += "text/xml";
            signedProperties += "</etsi:MimeType>";
            signedProperties += "</etsi:DataObjectFormat>";
            signedProperties += "</etsi:SignedDataObjectProperties>";
            signedProperties += "</etsi:SignedProperties>";
            sha1SignedProperties = sha1Base64(signedProperties.replace("<ets:SignedProperties", "<etsi:SignedProperties " + nameSpaces), "utf8");
            keyInfo = "";
            keyInfo += '<ds:KeyInfo Id="Certificate' + certificateNumber + '">';
            keyInfo += "\n<ds:X509Data>";
            keyInfo += "\n<ds:X509Certificate>\n";
            keyInfo += certificateX509;
            keyInfo += "\n</ds:X509Certificate>";
            keyInfo += "\n</ds:X509Data>";
            keyInfo += "\n<ds:KeyValue>";
            keyInfo += "\n<ds:RSAKeyValue>";
            keyInfo += "\n<ds:Modulus>\n";
            keyInfo += modulus;
            keyInfo += "\n</ds:Modulus>";
            keyInfo += "\n<ds:Exponent>\n";
            keyInfo += exponent;
            keyInfo += "\n</ds:Exponent>";
            keyInfo += "\n</ds:RSAKeyValue>";
            keyInfo += "\n</ds:KeyValue>";
            keyInfo += "\n</ds:KeyInfo>";
            sha1KeyInfo = sha1Base64(keyInfo.replace("<ds:KeyInfo", "<ds:KeyInfo " + nameSpaces), "utf8");
            signedInfo = "";
            signedInfo +=
                '<ds:SignedInfo Id="Signature-SignedInfo' + signedInfoNumber + '">';
            signedInfo +=
                '\n<ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315">';
            signedInfo += "</ds:CanonicalizationMethod>";
            signedInfo +=
                '\n<ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1">';
            signedInfo += "</ds:SignatureMethod>";
            signedInfo +=
                '\n<ds:Reference Id="SignedPropertiesID' +
                    signedPropertiesIdNumber +
                    '" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature' +
                    signatureNumber +
                    "-SignedProperties" +
                    signedPropertiesNumber +
                    '">';
            signedInfo +=
                '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
            signedInfo += "</ds:DigestMethod>";
            signedInfo += "\n<ds:DigestValue>";
            signedInfo += sha1SignedProperties;
            signedInfo += "</ds:DigestValue>";
            signedInfo += "\n</ds:Reference>";
            signedInfo += '\n<ds:Reference URI="#Certificate' + certificateNumber + '">';
            signedInfo +=
                '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
            signedInfo += "</ds:DigestMethod>";
            signedInfo += "\n<ds:DigestValue>";
            signedInfo += sha1KeyInfo;
            signedInfo += "</ds:DigestValue>";
            signedInfo += "\n</ds:Reference>";
            signedInfo +=
                '\n<ds:Reference Id="Reference-ID' +
                    referenceIdNumber +
                    '" URI="#comprobante">';
            signedInfo += "\n<ds:Transforms>";
            signedInfo +=
                '\n<ds:Transform Algorithm="http://www.w3.org/2000/09/xmlndsig#enveloped-signature">';
            signedInfo += "</ds:Transform>";
            signedInfo += "\n</ds:Transforms>";
            signedInfo +=
                '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">';
            signedInfo += "</ds:DigestMethod>";
            signedInfo += "\n<ds:DigestValue>";
            signedInfo += sha1_xml;
            signedInfo += "</ds:DigestValue>";
            signedInfo += "\n</ds:Reference>";
            signedInfo += "\n</ds:SignedInfo>";
            canonicalizedSignedInfo = signedInfo.replace("<ds:SignedInfo", "<ds:SignedInfo " + nameSpaces);
            md = forge.md.sha1.create();
            md.update(canonicalizedSignedInfo, "utf8");
            signature = btoa(key
                .sign(md)
                .match(/.{1,76}/g)
                .join("\n"));
            xadesBes = "";
            xadesBes +=
                "<ds:Signature " + nameSpaces + ' Id="Signature' + signatureNumber + '">';
            xadesBes += "\n" + signedInfo;
            xadesBes +=
                '\n<ds:SignatureValue Id="SignatureValue' + signatureValueNumber + '">\n';
            xadesBes += signature;
            xadesBes += "\n</ds:SignatureValue>";
            xadesBes += "\n" + keyInfo;
            xadesBes +=
                '\n<ds:Object Id="Signature' +
                    signatureNumber +
                    "-Object" +
                    objectNumber +
                    '">';
            xadesBes +=
                '<etsi:QualifyingProperties Target="#Signature' + signatureNumber + '">';
            xadesBes += signedProperties;
            xadesBes += "</etsi:QualifyingProperties>";
            xadesBes += "</ds:Object>";
            xadesBes += "</ds:Signature>";
            return [2 /*return*/, xml.replace(/(<[^<]+)$/, xadesBes + "$1")];
        });
    });
}
