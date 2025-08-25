"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.invoiceRepo = void 0;
exports.createInvoiceRepo = createInvoiceRepo;
var promises_1 = require("fs/promises");
var fs_1 = require("fs");
var path_1 = require("path");
/**
 * Implementación con Prisma (si está disponible)
 */
var PrismaRepo = /** @class */ (function () {
    function PrismaRepo() {
        try {
            // Intentar importar Prisma dinámicamente
            var PrismaClient = require('@prisma/client').PrismaClient;
            this.prisma = new PrismaClient();
        }
        catch (error) {
            throw new Error('Prisma no está disponible');
        }
    }
    PrismaRepo.prototype.upsertByClave = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var now, record, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        now = new Date();
                        record = __assign(__assign({}, data), { createdAt: data.createdAt || now, updatedAt: now });
                        return [4 /*yield*/, this.prisma.invoice.upsert({
                                where: { claveAcceso: data.claveAcceso },
                                update: record,
                                create: record
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error en PrismaRepo.upsertByClave:', error_1);
                        throw new Error("Error al guardar factura: ".concat(error_1 instanceof Error ? error_1.message : 'Error desconocido'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PrismaRepo.prototype.findByClave = function (claveAcceso) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.prisma.invoice.findUnique({
                                where: { claveAcceso: claveAcceso }
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error en PrismaRepo.findByClave:', error_2);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PrismaRepo.prototype.list = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var results, error_3;
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.prisma.invoice.findMany({
                                take: limit,
                                orderBy: { createdAt: 'desc' }
                            })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error en PrismaRepo.list:', error_3);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return PrismaRepo;
}());
/**
 * Implementación con JSON como fallback
 */
var JsonRepo = /** @class */ (function () {
    function JsonRepo() {
        this.data = [];
        this.filePath = path_1.default.join(process.cwd(), 'data', 'invoices.json');
        this.ensureDataDirectory();
    }
    JsonRepo.prototype.ensureDataDirectory = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dataDir;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dataDir = path_1.default.dirname(this.filePath);
                        if (!!(0, fs_1.existsSync)(dataDir)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, promises_1.mkdir)(dataDir, { recursive: true })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    JsonRepo.prototype.loadData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fileContent, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!(0, fs_1.existsSync)(this.filePath)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, promises_1.readFile)(this.filePath, 'utf8')];
                    case 1:
                        fileContent = _a.sent();
                        this.data = JSON.parse(fileContent);
                        return [3 /*break*/, 3];
                    case 2:
                        this.data = [];
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        console.error('Error cargando datos JSON:', error_4);
                        this.data = [];
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    JsonRepo.prototype.saveData = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tempPath, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        tempPath = this.filePath + '.tmp';
                        return [4 /*yield*/, (0, promises_1.writeFile)(tempPath, JSON.stringify(this.data, null, 2), 'utf8')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, promises_1.rename)(tempPath, this.filePath)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Error guardando datos JSON:', error_5);
                        throw new Error('Error al guardar datos');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    JsonRepo.prototype.upsertByClave = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var now, record, existingIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadData()];
                    case 1:
                        _a.sent();
                        now = new Date();
                        record = __assign(__assign({}, data), { id: data.id || "inv_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)), createdAt: data.createdAt || now, updatedAt: now });
                        existingIndex = this.data.findIndex(function (item) { return item.claveAcceso === data.claveAcceso; });
                        if (existingIndex >= 0) {
                            // Actualizar registro existente
                            this.data[existingIndex] = record;
                        }
                        else {
                            // Crear nuevo registro
                            this.data.push(record);
                        }
                        return [4 /*yield*/, this.saveData()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, record];
                }
            });
        });
    };
    JsonRepo.prototype.findByClave = function (claveAcceso) {
        return __awaiter(this, void 0, void 0, function () {
            var record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadData()];
                    case 1:
                        _a.sent();
                        record = this.data.find(function (item) { return item.claveAcceso === claveAcceso; });
                        return [2 /*return*/, record || null];
                }
            });
        });
    };
    JsonRepo.prototype.list = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            if (limit === void 0) { limit = 50; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadData()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.data
                                .sort(function (a, b) {
                                var dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                                var dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                                return dateB - dateA;
                            })
                                .slice(0, limit)];
                }
            });
        });
    };
    return JsonRepo;
}());
/**
 * Factory para crear el repositorio apropiado
 */
function createInvoiceRepo() {
    try {
        // Intentar usar Prisma si está disponible
        return new PrismaRepo();
    }
    catch (error) {
        console.info('Prisma no disponible, usando JSON como fallback');
        return new JsonRepo();
    }
}
// Exportar instancia por defecto
exports.invoiceRepo = createInvoiceRepo();
