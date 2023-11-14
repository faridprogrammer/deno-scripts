import { passwordGenerator } from "https://deno.land/x/password_generator@latest/mod.ts";
import { writeText } from "https://deno.land/x/copy_paste@v1.1.3/mod.ts";

const password = passwordGenerator('*', 20)
console.log(`%cPassword: ${password}`, "color: green")

await writeText(password)

console.log('%cAlso copied to clipboard...', "color: green")
