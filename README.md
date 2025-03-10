# CStart Language

CStart is a simple, interpreted programming language designed for educational purposes. It implements core programming concepts like variables, arithmetic operations, conditionals, and loops in a straightforward syntax inspired by C-style languages.

## Features

- **Variables**: All variable names must start with 'c' (e.g., `csum`, `cvar`, `cresult`)
- **Arithmetic Operations**: Basic operations like addition (`+`)
- **Comparison Operators**: Support for `<` and `>` operators
- **Control Structures**: If-else statements and for loops
- **Code Blocks**: Enclosed in curly braces `{}`
- **Persistent Environment**: Variables maintain their values between expressions

## Language Syntax

### Variables and Assignment

```
cvar = 42;     // Assign a value to a variable
csum = cvar + 5;  // Use variables in expressions
```

### Arithmetic

```
5 + 3          // Basic addition
cvar + 10      // Add a value to a variable
```

### Conditionals

```
if (cvar > 5) {
  cresult = 1;
} else {
  cresult = 0;
}
```

### Loops

```
for (ci = 0; ci < 5; ci = ci + 1) {
  csum = csum + ci;
}
```

## Implementation Details

The CStart interpreter follows a standard 3-step process:

1. **Tokenization (Lexer)**: Converts source code text into tokens
2. **Parsing**: Converts tokens into an Abstract Syntax Tree (AST)
3. **Evaluation**: Executes the AST to produce a result

The interpreter maintains a persistent environment, allowing variables to retain their values across multiple interpret calls.

## Running CStart

### Installation

```bash
bun install
```

### Running the Example Tests

```bash
bun run index.ts
```

### Interactive REPL Mode

Start an interactive session where you can type CStart code and see immediate results:

```bash
bun run index.ts --repl
```

In REPL mode, you can enter code line by line, and variables will persist between commands. Press Ctrl+C to exit.

## Example Programs

### Calculate Sum of Numbers 0-4

```
csum = 0;
for (ci = 0; ci < 5; ci = ci + 1) {
  csum = csum + ci;
}
csum;  // Returns 10 (0+1+2+3+4)
```

### Check if a Number is Greater Than 5

```
cval = 7;
if (cval > 5) {
  cresult = "greater";
} else {
  cresult = "less or equal";
}
cresult;  // Returns "greater"
```

## Limitations

- Only supports numeric values
- Variable names must start with 'c'
- Limited set of operators and control structures
- No function definitions

## Future Enhancements

- Support for additional operators (-, *, /)
- Function definitions and calls
- More data types (strings, arrays)
- Enhanced error handling

---

This project was created using Bun. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
