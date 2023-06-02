
![enter image description here](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/600-artist-palette.svg/240px-600-artist-palette.svg.png)
# Coding-Style-Guide 

The following document contains programming guidelines that all developers must follow. Improvements are welcome but must always be discussed with the team. This coding style guide should not necessarily be seen as best practice but more about creating consistent code in the same style.  


# Generall


The use of the `any` type is not allowed. If the type is not known `unknown` should be used. 
If possible `const` should always be used instead of `let`. 
Any code written must be formatted with prettier before committing. It is recommended to configure prettier to automatically format the code when it is saved.
The following prettier package is recommended for JavaScript/TypeScript: *esbenp.prettier-vscode*. 
Furthermore the use of ESLint is mandatory. For this the following extension is recommended: *dbaeumer.vscode-eslint*. 
New code must not contain eslint errors. Missing/unnecessary linter rules can be added/removed in consultation with the team.
If linter rules are disabled for single lines or files and it is not obvious why, it is mandatory to leave an explanation in a comment. 

If you can, try to fix stuff when editing old files.

## Working rules
For this project we are working with the software development methodology Extreme Programming (XP). The most important values of XP are communication, simplicity, feedback, courage and respect. We are trying to adapt these values the best we can. The following are the most important rules of Extreme Programming which we should always follow:
 - programm in pairs. Coding alone is not allowed
 - communicate new features in the team before implementing
 - test-driven-development: always write a failing test first before writing new code
 - leave the working space cleaner than it was before

## Language

Code → All classes, methods, functions and names as well as comments in English
Branch Namen → Englisch
Commit Messages → Englisch
Error Messages → Englisch
Vue Frontend → Deutsch


## Gitlab Pipeline

If the Gitlab pipeline fails after a commit, it is the developer's responsibility to fix the pipeline as soon as possible. Sometimes it fails because of a defect runner.

## Git
![enter image description here](https://statusneo.com/wp-content/uploads/2022/08/tbd_workflow.drawio-1-1.png)
This branching strategy requires no branches. Developers integrate their daily changes into the shared main branch. In other words, commit changes frequently directly into main and don't use feature branches.

### Commit Messages
To make our commit messages consistent we want to follow the Conventional Commits 1.0.0 specification. For more information see:
[Conventional Commits Doku
](https://www.conventionalcommits.org/en/v1.0.0/)

Make sure you'll at least prefix the commit with **fix**, **feat** or **chore**. Please use the imperative form (Commit messages should be the continuation of the sentence “If applied, this commit will...”). Also make them at least somewhat descriptive. At least give a vague description what you did and why you did it. So instead of "bugfix" as commit message tell your future self and your fellow students which bug you fixed with this commit. If your commit is related to an isolated module, state the scope. For a fix in the generateImage module, the commit message should start with fix(generateImage): .


## Naming Conventions

 - Interfaces: always start with a capital `I` (e.g. `IFlightData`).
 - File names: should use the `kebab-case` notation. The use of a file should be separated with a dot (e.g. `import-flight-data.service.ts`).
 - classes: Use the `PascalCase` notation (e.g. `DataImporter`).
 - Methods / functions: use the `camelCase` notation (e.g. `calculateFlightRoute)`
 - Enums: The enum name is `PascalCase`, field names in the enum are `ALL_UPPER_CASE` and the string values in `camelCase`.

