const fs = require("fs");
const path = require("path");

// Читаем JSON файл
const filePath = path.join(__dirname, "src/app/data/level3-texts.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

console.log("Анализ символов в level3-texts.json\n");

data.forEach((item, index) => {
  const text = item.text;
  console.log(`=== Текст ${index + 1} ===`);
  console.log(`Длина: ${text.length} символов`);

  // Массив для хранения проблематичных символов
  const problematicChars = [];
  const charCounts = {};

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charCode = char.charCodeAt(0);

    // Подсчитываем символы
    charCounts[char] = (charCounts[char] || 0) + 1;

    // Проверяем на проблематичные символы
    let isProblematic = false;
    let reason = "";

    // Непечатаемые символы (кроме обычных пробелов и переносов)
    if (
      charCode < 32 &&
      char !== " " &&
      char !== "\n" &&
      char !== "\r" &&
      char !== "\t"
    ) {
      isProblematic = true;
      reason = "непечатаемый символ";
    }

    // Символы вне обычного диапазона
    if (charCode > 127 && charCode < 160) {
      isProblematic = true;
      reason = "символ в диапазоне 128-159";
    }

    // Различные виды пробелов
    if (charCode === 160) {
      // неразрывный пробел
      isProblematic = true;
      reason = "неразрывный пробел (NBSP)";
    }

    if (charCode === 8203) {
      // zero-width space
      isProblematic = true;
      reason = "невидимый пробел (zero-width space)";
    }

    // Другие невидимые символы
    if (charCode >= 8204 && charCode <= 8207) {
      isProblematic = true;
      reason = "невидимый форматирующий символ";
    }

    if (isProblematic) {
      problematicChars.push({
        char: char,
        position: i,
        charCode: charCode,
        reason: reason,
        context: text.substring(Math.max(0, i - 5), i + 6),
      });
    }
  }

  if (problematicChars.length > 0) {
    console.log(
      `❌ Найдено ${problematicChars.length} проблематичных символов:`,
    );
    problematicChars.forEach((item) => {
      console.log(
        `  - Позиция ${item.position}: "${item.char}" (код: ${item.charCode}) - ${item.reason}`,
      );
      console.log(`    Контекст: "${item.context}"`);
    });
  } else {
    console.log("✅ Проблематичных символов не найдено");
  }

  // Показываем статистику необычных символов
  const unusualChars = Object.entries(charCounts)
    .filter(([char, count]) => {
      const code = char.charCodeAt(0);
      return code > 127 || code < 32;
    })
    .sort((a, b) => b[1] - a[1]);

  if (unusualChars.length > 0) {
    console.log("\n📊 Необычные символы в тексте:");
    unusualChars.forEach(([char, count]) => {
      const code = char.charCodeAt(0);
      let description = char;
      if (code === 32) description = "пробел";
      else if (code === 10) description = "перенос строки";
      else if (code === 13) description = "возврат каретки";
      else if (code === 9) description = "табуляция";
      else if (code === 160) description = "неразрывный пробел";

      console.log(`  "${description}" (код: ${code}) - ${count} раз`);
    });
  }

  console.log("");
});

console.log("Анализ завершен.");
