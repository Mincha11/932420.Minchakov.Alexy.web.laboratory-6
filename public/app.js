const form = document.getElementById("calculator-form");
const resultBox = document.getElementById("result");

// Проверяем, существует ли форма на странице.
if (form) {

    form.addEventListener("submit", async (event) => {

        // Не даём странице перезагрузиться.
        event.preventDefault();

        // Получаем значения из полей.
        const a = document.getElementById("number-a").value.trim();
        const b = document.getElementById("number-b").value.trim();
        const op = document.getElementById("operation").value;

        // Формируем query-параметры.
        const params = new URLSearchParams({
            a: a,
            b: b,
            op: op
        });

        resultBox.className = "result";
        resultBox.textContent = "Выполняется вычисление...";

        try {

            // Отправляем запрос серверу.
            const response = await fetch(`/api/calc?${params.toString()}`);

            // Получаем JSON.
            const data = await response.json();

            // Проверяем, не вернул ли сервер ошибку.
            if (!response.ok) {
                resultBox.classList.add("error");
                resultBox.textContent = `Ошибка: ${data.error}`;
                return;
            }

            // Показываем результат.
            resultBox.classList.add("success");

            resultBox.textContent =
                `${data.expression} = ${data.result}`;

        } catch (error) {

            resultBox.classList.add("error");

            resultBox.textContent =
                "Не удалось связаться с сервером.";

        }

    });

}

// Регистрируем Service Worker.
if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("/service-worker.js")

            .then(() => {
                console.log("Service Worker зарегистрирован.");
            })

            .catch((error) => {
                console.error("Ошибка регистрации:", error);
            });

    });

}