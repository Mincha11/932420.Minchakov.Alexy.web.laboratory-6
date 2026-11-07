const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Раздаём статические файлы из папки public.
app.use(express.static(path.join(__dirname, "public")));

// Главная страница.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Страница «О проекте».
app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "about.html"));
});

// API калькулятора.
app.get("/api/calc", (req, res) => {
    const { a, b, op } = req.query;

    // Проверяем наличие параметров.
    if (
        typeof a !== "string" ||
        typeof b !== "string" ||
        typeof op !== "string" ||
        a.trim() === "" ||
        b.trim() === ""
    ) {
        return res.status(400).json({
            error: "Передайте параметры a, b и op."
        });
    }

    // Преобразуем параметры в числа.
    const numA = Number(a);
    const numB = Number(b);

    // Проверяем корректность чисел.
    if (!Number.isFinite(numA) || !Number.isFinite(numB)) {
        return res.status(400).json({
            error: "Параметры a и b должны быть корректными числами."
        });
    }

    // Проверяем допустимые операции.
    const allowedOperations = ["+", "-", "*", "/"];

    if (!allowedOperations.includes(op)) {
        return res.status(400).json({
            error: "Неизвестная операция. Допустимы +, -, *, /."
        });
    }

    // Проверяем деление на ноль.
    if (op === "/" && numB === 0) {
        return res.status(400).json({
            error: "Делить на ноль нельзя."
        });
    }

    let result;

    // Выполняем вычисление.
    switch (op) {
        case "+":
            result = numA + numB;
            break;

        case "-":
            result = numA - numB;
            break;

        case "*":
            result = numA * numB;
            break;

        case "/":
            result = numA / numB;
            break;
    }

    // Проверяем, что результат является конечным числом.
    if (!Number.isFinite(result)) {
        return res.status(400).json({
            error: "Результат вычисления не является конечным числом."
        });
    }

    // Возвращаем JSON-ответ.
    res.json({
        result: Number(result.toFixed(10)),
        expression: `${a}${op}${b}`,
        error: null
    });
});

// Обработка неизвестных API-маршрутов.
app.use("/api", (req, res) => {
    res.status(404).json({
        error: "API-маршрут не найден."
    });
});

// Обработка остальных неизвестных страниц.
app.use((req, res) => {
    res.status(404).send("Страница не найдена (404).");
});

// Запуск сервера.
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
});