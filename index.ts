/**
 * INTERPRETER OVERVIEW
 *
 * This interpreter follows a standard 3-step process:
 * 1. Tokenization (Lexer): Converts source code text into tokens
 * 2. Parsing: Converts tokens into an Abstract Syntax Tree (AST)
 * 3. Evaluation: Executes the AST to produce a result
 *
 * The interpreter supports basic features like:
 * - Arithmetic operations (+, -, *, /)
 * - Variable assignment and retrieval
 * - Conditional statements (if-else)
 * - Loops (for)
 * - Comparison operators (>, <)
 */

// Define token types as an enum for better type safety
// These represent the different kinds of symbols in our language
enum TokenType {
  Number = "Number", // Numeric literals like 42
  Operator = "Operator", // +, -, *, /, =
  Paren = "Paren", // ( and )
  Identifier = "Identifier", // Variable names (must start with 'c')
  Keyword = "Keyword", // Reserved words: 'for', 'if', 'else'
  Semicolon = "Semicolon", // ; to end statements
  Brace = "Brace", // { and } for blocks
  Comparator = "Comparator", // < and > for comparisons
}

// Define the structure of a token
// Each token has a type and a value
interface Token {
  type: TokenType; // What kind of token it is
  value: string | number; // The actual text or number it represents
}

// Define AST node types
// These represent the different kinds of constructs in our language's syntax tree
enum NodeType {
  Number = "Number", // Numeric literals
  BinaryOp = "BinaryOp", // Binary operations like 1 + 2
  Identifier = "Identifier", // Variable references
  Assignment = "Assignment", // Variable assignments like x = 5
  Block = "Block", // A block of statements
  IfElse = "IfElse", // If-else conditional
  ForLoop = "ForLoop", // For loop
  Comparison = "Comparison", // Comparison expressions like a < b
}

// Define the structure of AST nodes
// This is a unified interface for all node types in our Abstract Syntax Tree
interface ASTNode {
  type: NodeType; // What kind of node it is
  value?: number | string; // For Number and Identifier nodes
  operator?: string; // For BinaryOp and Comparison nodes (e.g., '+', '<')
  left?: ASTNode; // Left operand for BinaryOp, Assignment, Comparison
  right?: ASTNode; // Right operand for BinaryOp, Assignment, Comparison
  condition?: ASTNode; // Condition for IfElse and ForLoop
  body?: ASTNode; // Body for IfElse and ForLoop
  elseBody?: ASTNode; // Else branch for IfElse
  init?: ASTNode; // Initialization for ForLoop
  update?: ASTNode; // Update step for ForLoop
  statements?: ASTNode[]; // List of statements for Block nodes
}

/**
 * Environment Class
 *
 * The Environment class manages the state of variables during program execution.
 * It provides a way to store and retrieve variable values by their names.
 * This is essentially the memory of our interpreter.
 */
class Environment {
  private variables: Map<string, number>; // Store variable names and their values

  constructor() {
    this.variables = new Map(); // Initialize an empty variable store
  }

  /**
   * Sets a variable's value in the environment
   * @param name - The variable name
   * @param value - The numeric value to assign
   */
  setVariable(name: string, value: number): void {
    this.variables.set(name, value);
  }

  /**
   * Gets a variable's value from the environment
   * @param name - The variable name to look up
   * @returns The variable's numeric value
   * @throws Error if the variable doesn't exist
   */
  getVariable(name: string): number {
    if (!this.variables.has(name)) {
      throw new Error(`Variable ${name} not found`);
    }
    return this.variables.get(name)!;
  }
}

/**
 * Tokenizer (Lexer) Class
 *
 * The Tokenizer breaks down the input source code into tokens.
 * Each token represents a meaningful unit in the language (like a number, operator, or keyword).
 * This is the first step in the interpretation process.
 */
class Tokenizer {
  private input: string; // The source code to tokenize
  private position: number; // Current position in the input
  private tokens: Token[]; // Collected tokens

  /**
   * Creates a new Tokenizer for the given input
   * @param input - Source code to tokenize
   */
  constructor(input: string) {
    this.input = input.trim(); // Remove leading/trailing whitespace
    this.position = 0; // Start at the beginning
    this.tokens = []; // Start with empty token list
  }

  /**
   * Processes the input string and converts it into a sequence of tokens
   * @returns Array of tokens representing the input
   * @throws Error for unexpected characters or invalid variable names
   */
  tokenize(): Token[] {
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      // Skip whitespace
      if (/\s/.test(char)) {
        this.position++;
        continue;
      }

      // Process numbers (sequences of digits)
      if (/[0-9]/.test(char)) {
        let num = "";
        while (
          this.position < this.input.length &&
          /[0-9]/.test(this.input[this.position])
        ) {
          num += this.input[this.position];
          this.position++;
        }
        this.tokens.push({ type: TokenType.Number, value: parseFloat(num) });
        continue;
      }

      // Process arithmetic operators (+, -, *, /)
      if (/[\+\-\*\/]/.test(char)) {
        this.tokens.push({ type: TokenType.Operator, value: char });
        this.position++;
        continue;
      }

      // Process comparison operators (<, >)
      if (/[<>]/.test(char)) {
        this.tokens.push({ type: TokenType.Comparator, value: char });
        this.position++;
        continue;
      }

      // Process assignment operator (=)
      if (char === "=") {
        this.tokens.push({ type: TokenType.Operator, value: char });
        this.position++;
        continue;
      }

      // Process parentheses
      if (char === "(" || char === ")") {
        this.tokens.push({ type: TokenType.Paren, value: char });
        this.position++;
        continue;
      }

      // Process braces (for blocks)
      if (char === "{" || char === "}") {
        this.tokens.push({ type: TokenType.Brace, value: char });
        this.position++;
        continue;
      }

      // Process semicolons (statement terminators)
      if (char === ";") {
        this.tokens.push({ type: TokenType.Semicolon, value: char });
        this.position++;
        continue;
      }

      // Process identifiers and keywords
      if (/[a-zA-Z]/.test(char)) {
        let ident = "";
        while (
          this.position < this.input.length &&
          /[a-zA-Z0-9]/.test(this.input[this.position])
        ) {
          ident += this.input[this.position];
          this.position++;
        }
        // Check if it's a keyword
        if (["for", "if", "else"].includes(ident)) {
          this.tokens.push({ type: TokenType.Keyword, value: ident });
        }
        // Check if it's a valid variable (must start with 'c')
        else if (ident.startsWith("c")) {
          this.tokens.push({ type: TokenType.Identifier, value: ident });
        }
        // Invalid variable name
        else {
          throw new Error(`Variable names must start with 'c': ${ident}`);
        }
        continue;
      }

      // If we get here, we encountered an unexpected character
      throw new Error(`Unexpected character: ${char}`);
    }
    return this.tokens;
  }
}

/**
 * Parser Class
 *
 * The Parser takes a stream of tokens and converts them into an Abstract Syntax Tree (AST).
 * The AST represents the hierarchical structure of the program and is used by the evaluator
 * to execute the code. This is the second step in the interpretation process.
 */
class Parser {
  private tokens: Token[]; // The tokens to parse
  private position: number; // Current position in the token stream

  /**
   * Creates a new Parser for the given tokens
   * @param tokens - Array of tokens from the Tokenizer
   */
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.position = 0;
  }

  /**
   * Entry point for parsing - parses the entire program
   * @returns The root AST node representing the program
   */
  parse(): ASTNode {
    return this.program();
  }

  /**
   * Parses a complete program as a sequence of statements
   * @returns A Block node containing all statements in the program
   */
  private program(): ASTNode {
    const statements: ASTNode[] = [];
    while (this.position < this.tokens.length) {
      statements.push(this.statement());
    }
    return { type: NodeType.Block, statements };
  }

  /**
   * Parses a single statement
   * Different types of statements are handled based on their starting token
   * @returns An AST node representing the statement
   */
  private statement(): ASTNode {
    const token = this.currentToken();

    // Handle if-else statements
    if (token.type === TokenType.Keyword && token.value === "if") {
      return this.ifElseStatement();
    }

    // Handle for loops
    if (token.type === TokenType.Keyword && token.value === "for") {
      return this.forLoopStatement();
    }

    // Handle code blocks (enclosed in braces)
    if (token.type === TokenType.Brace && token.value === "{") {
      return this.blockStatement();
    }

    // Handle expressions (including assignments)
    const expr = this.expression();
    if (this.currentToken()?.type === TokenType.Semicolon) {
      this.position++; // Skip the semicolon
    }
    return expr;
  }

  /**
   * Parses an if-else statement
   * Format: if (condition) statement [else statement]
   * @returns An IfElse AST node
   * @throws Error if the syntax is invalid
   */
  private ifElseStatement(): ASTNode {
    this.position++; // Skip 'if'

    // Ensure there's an opening parenthesis
    if (
      this.currentToken().type !== TokenType.Paren ||
      this.currentToken().value !== "("
    ) {
      throw new Error("Expected '(' after 'if'");
    }
    this.position++; // Skip '('

    // Parse the condition expression
    const condition = this.expression();

    // Ensure there's a closing parenthesis
    if (
      this.currentToken().type !== TokenType.Paren ||
      this.currentToken().value !== ")"
    ) {
      throw new Error("Expected ')' after condition");
    }
    this.position++; // Skip ')'

    // Parse the main body (the 'then' part)
    const body = this.statement();

    // Check for an optional 'else' clause
    let elseBody: ASTNode | undefined;
    if (
      this.currentToken()?.type === TokenType.Keyword &&
      this.currentToken().value === "else"
    ) {
      this.position++; // Skip 'else'
      elseBody = this.statement(); // Parse the 'else' body
    }

    // Create and return the IfElse node
    return { type: NodeType.IfElse, condition, body, elseBody };
  }

  /**
   * Parses a for loop statement
   * Format: for (initialization; condition; update) statement
   * @returns A ForLoop AST node
   * @throws Error if the syntax is invalid
   */
  private forLoopStatement(): ASTNode {
    this.position++; // Skip 'for'

    // Ensure there's an opening parenthesis
    if (
      this.currentToken().type !== TokenType.Paren ||
      this.currentToken().value !== "("
    ) {
      throw new Error("Expected '(' after 'for'");
    }
    this.position++; // Skip '('

    // Parse initialization (typically a variable assignment)
    const init = this.expression(); // e.g., cvar = 0
    if (this.currentToken().type !== TokenType.Semicolon) {
      throw new Error("Expected ';' after init in for loop");
    }
    this.position++; // Skip ';'

    // Parse loop condition (determines when to stop)
    const condition = this.expression(); // e.g., cvar < 5
    if (this.currentToken().type !== TokenType.Semicolon) {
      throw new Error("Expected ';' after condition in for loop");
    }
    this.position++; // Skip ';'

    // Parse update expression (executed after each iteration)
    const update = this.expression(); // e.g., cvar = cvar + 1
    if (
      this.currentToken().type !== TokenType.Paren ||
      this.currentToken().value !== ")"
    ) {
      throw new Error("Expected ')' after update in for loop");
    }
    this.position++; // Skip ')'

    // Parse the loop body
    const body = this.statement();

    // Create and return the ForLoop node
    return { type: NodeType.ForLoop, init, condition, update, body };
  }

  /**
   * Parses a block statement - a sequence of statements enclosed in braces
   * Format: { statement; statement; ... }
   * @returns A Block AST node containing all statements in the block
   * @throws Error if the closing brace is missing
   */
  private blockStatement(): ASTNode {
    this.position++; // Skip '{'
    const statements: ASTNode[] = [];

    // Parse statements until we reach the closing brace
    while (
      this.position < this.tokens.length &&
      !(
        this.currentToken().type === TokenType.Brace &&
        this.currentToken().value === "}"
      )
    ) {
      statements.push(this.statement());
    }

    // Ensure the block is properly closed
    if (
      this.currentToken().type !== TokenType.Brace ||
      this.currentToken().value !== "}"
    ) {
      throw new Error("Expected '}' to close block");
    }
    this.position++; // Skip '}'

    // Create and return the Block node
    return { type: NodeType.Block, statements };
  }

  /**
   * Parses expressions, with special handling for assignments
   * Checks if the current expression is an assignment (identifier = expression)
   * @returns An AST node representing the expression
   */
  private expression(): ASTNode {
    // Check if this is an assignment expression (e.g., cvar = 5)
    if (
      this.currentToken().type === TokenType.Identifier &&
      this.tokens[this.position + 1]?.type === TokenType.Operator &&
      this.tokens[this.position + 1].value === "="
    ) {
      const ident = this.currentToken();
      this.position++; // Skip identifier
      this.position++; // Skip '='

      // Parse the right-hand side of the assignment
      const right = this.expression();

      // Create and return the Assignment node
      return {
        type: NodeType.Assignment,
        left: { type: NodeType.Identifier, value: ident.value },
        right,
      };
    }

    // If not an assignment, parse as a comparison expression
    return this.comparison();
  }

  /**
   * Parses comparison expressions (using <, >)
   * @returns An AST node representing the comparison
   */
  private comparison(): ASTNode {
    // First parse the left operand (which may be an additive expression)
    let node = this.additive();

    // Look for comparison operators and build a chain if needed
    while (
      this.position < this.tokens.length &&
      this.currentToken().type === TokenType.Comparator
    ) {
      const op = this.currentToken().value as string;
      this.position++;

      // Parse the right operand
      const right = this.additive();

      // Create a new comparison node
      node = { type: NodeType.Comparison, operator: op, left: node, right };
    }

    return node;
  }

  /**
   * Parses additive expressions (using + and -)
   * Follows the order of operations by handling multiplication/division first
   * @returns An AST node representing the additive expression
   */
  private additive(): ASTNode {
    // First parse a multiplicative expression as the left operand
    let node = this.multiplicative();

    // Look for + or - operators and build a chain if needed
    while (
      this.position < this.tokens.length &&
      this.currentToken().type === TokenType.Operator &&
      ["+", "-"].includes(this.currentToken().value as string)
    ) {
      const op = this.currentToken().value as string;
      this.position++;

      // Parse the right operand (which must be a multiplicative expression)
      const right = this.multiplicative();

      // Create a new binary operation node
      node = { type: NodeType.BinaryOp, operator: op, left: node, right };
    }

    return node;
  }

  /**
   * Parses multiplicative expressions (using * and /)
   * These have higher precedence than additive expressions
   * @returns An AST node representing the multiplicative expression
   */
  private multiplicative(): ASTNode {
    // First parse a factor as the left operand
    let node = this.factor();

    // Look for * or / operators and build a chain if needed
    while (
      this.position < this.tokens.length &&
      this.currentToken().type === TokenType.Operator &&
      ["*", "/"].includes(this.currentToken().value as string)
    ) {
      const op = this.currentToken().value as string;
      this.position++;

      // Parse the right operand (which must be a factor)
      const right = this.factor();

      // Create a new binary operation node
      node = { type: NodeType.BinaryOp, operator: op, left: node, right };
    }

    return node;
  }

  /**
   * Parses the most basic expressions (factors): numbers, variables, or parenthesized expressions
   * These are the highest precedence elements in the grammar
   * @returns An AST node representing the factor
   * @throws Error if the token is not a valid factor
   */
  private factor(): ASTNode {
    const token = this.currentToken();

    // Handle numeric literals
    if (token.type === TokenType.Number) {
      this.position++;
      return { type: NodeType.Number, value: token.value as number };
    }

    // Handle variable references
    if (token.type === TokenType.Identifier) {
      this.position++;
      return { type: NodeType.Identifier, value: token.value as string };
    }

    // Handle parenthesized expressions - allows grouping and precedence override
    if (token.type === TokenType.Paren && token.value === "(") {
      this.position++; // Skip opening parenthesis

      // Parse the expression inside the parentheses
      const node = this.expression();

      // Ensure there's a closing parenthesis
      if (
        this.currentToken().type !== TokenType.Paren ||
        this.currentToken().value !== ")"
      ) {
        throw new Error("Expected closing parenthesis");
      }
      this.position++; // Skip closing parenthesis

      // Return the parsed expression
      return node;
    }

    // If we get here, we encountered an unexpected token
    throw new Error(`Unexpected token: ${token.value}`);
  }

  /**
   * Helper method to get the current token without advancing position
   * @returns The current token at the current position
   */
  private currentToken(): Token {
    return this.tokens[this.position];
  }
}

// Step 3: Evaluator
class Evaluator {
  private env: Environment;

  constructor() {
    this.env = new Environment();
  }

  evaluate(ast: ASTNode): number | void {
    switch (ast.type) {
      case NodeType.Number:
        return ast.value as number;

      case NodeType.Identifier:
        return this.env.getVariable(ast.value as string);

      case NodeType.BinaryOp:
        const left = this.evaluate(ast.left as ASTNode) as number;
        const right = this.evaluate(ast.right as ASTNode) as number;
        switch (ast.operator) {
          case "+":
            return left + right;
          case "-":
            return left - right;
          case "*":
            return left * right;
          case "/":
            return left / right;
          default:
            throw new Error(`Unknown operator: ${ast.operator}`);
        }

      case NodeType.Comparison:
        const leftComp = this.evaluate(ast.left as ASTNode) as number;
        const rightComp = this.evaluate(ast.right as ASTNode) as number;
        switch (ast.operator) {
          case "<":
            return leftComp < rightComp ? 1 : 0;
          case ">":
            return leftComp > rightComp ? 1 : 0;
          default:
            throw new Error(`Unknown comparator: ${ast.operator}`);
        }

      case NodeType.Assignment:
        const ident = ast.left!.value as string;
        const value = this.evaluate(ast.right as ASTNode) as number;
        this.env.setVariable(ident, value);
        return value;

      case NodeType.Block:
        let result: number | void = undefined; // Initialize with a default value
        for (const stmt of ast.statements!) {
          result = this.evaluate(stmt);
        }
        return result;

      case NodeType.IfElse:
        const condition = this.evaluate(ast.condition as ASTNode) as number;
        if (condition) {
          return this.evaluate(ast.body as ASTNode);
        } else if (ast.elseBody) {
          return this.evaluate(ast.elseBody);
        }
        return;

      case NodeType.ForLoop:
        this.evaluate(ast.init as ASTNode); // Initialize
        while (this.evaluate(ast.condition as ASTNode) as number) {
          this.evaluate(ast.body as ASTNode);
          this.evaluate(ast.update as ASTNode); // Update
        }
        return;

      default:
        throw new Error(`Unknown AST node type: ${ast.type}`);
    }
  }
}

// Step 4: Putting It All Together
// Create a single persistent evaluator with its environment
const globalEvaluator = new Evaluator();

function interpret(input: string): number | void {
  // Tokenize
  const tokenizer = new Tokenizer(input);
  const tokens = tokenizer.tokenize();
  console.log("Tokens:", tokens);

  // Parse
  const parser = new Parser(tokens);
  const ast = parser.parse();
  console.log("AST:", JSON.stringify(ast, null, 2));

  // Evaluate using the global evaluator
  return globalEvaluator.evaluate(ast);
}

/**
 * Creates an interactive REPL (Read-Eval-Print-Loop) for the interpreter
 * Maintains state between commands and runs until Ctrl+C is pressed
 */
function startREPL() {
  const readline = require('readline');
  
  // Create interface for reading from stdin and writing to stdout
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  });

  console.log('JavaScript Interpreter REPL');
  console.log('Enter code to interpret. Variables will persist between commands.');
  console.log('Press Ctrl+C to exit.');
  rl.prompt();

  // Handle each line of input
  rl.on('line', (line: string) => {
    try {
      // Skip empty lines
      if (line.trim()) {
        // Evaluate the input and print the result
        const result = interpret(line);
        if (result !== undefined) {
          console.log(result);
        }
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
    }
    rl.prompt();
  });

  // Handle Ctrl+C
  rl.on('close', () => {
    console.log('\nExiting interpreter. Goodbye!');
    process.exit(0);
  });
}

// Run example tests or start REPL based on command line arguments
if (process.argv.includes('--repl')) {
  // Start the REPL
  startREPL();
} else {
  // Test the interpreter
  try {
    // Test variable assignment and usage
    console.log("Test 1: Variable assignment");
    interpret("csum = 0; csum = csum + 5;");
    console.log("Result:", interpret("csum")); // Should print 5

    // Test for loop
    console.log("Test 2: For loop");
    interpret(`
      csum = 0;
      for (ci = 0; ci < 5; ci = ci + 1) {
        csum = csum + ci;
      }
    `);
    console.log("Result:", interpret("csum")); // Should print 10 (0+1+2+3+4)

    // Test if-else
    console.log("Test 3: If-else");
    interpret(`
      cval = 7;
      if (cval > 5) {
        cresult = 1;
      } else {
        cresult = 0;
      }
    `);
    console.log("Result:", interpret("cresult")); // Should print 1
    console.log("---------------------------------");
    console.log("Test 4: If-else");

    interpret("cval = 3; if (cval > 5) { cresult = 1; } else { cresult = 0; }");
    console.log("Result:", interpret("cresult")); // Should print 0
    
    console.log("\n---------------------------------");
    console.log("To start the interactive REPL, run: ts-node index.ts --repl");
  } catch (error) {
    console.error("Error:", (error as Error).message);
  }
}
