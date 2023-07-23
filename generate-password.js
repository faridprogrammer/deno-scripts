import passwordGenerator from 'generate-password'
import clipboard from "clipboardy";

let password = passwordGenerator.generate({
    length: 20,
    lowercase: true,
    numbers: true,
    symbols: true,
    uppercase: true
});

console.log(`Password: ${password}`);

clipboard.write(password);

console.log(`Also copied to clipboard...`);
