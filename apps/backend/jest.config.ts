const config = {
    moduleFileExtensions: ["js", "json", "ts"],

    rootDir: "src",

    testRegex: ".*\\.spec\\.ts$",

    transform: {
        "^.+\\.(t|j)s$": "ts-jest",
    },

    // Temporarily since we are only testing the .usecase.ts files
    collectCoverageFrom: [
        "application/**/*.use-case.ts",
        "!**/*.spec.ts",
    ],

    // For later when we start testing the hole app
    // collectCoverageFrom: [
    //     "**/*.ts",
    //     "!**/*.spec.ts",
    //     "!**/*.module.ts",
    //     "!**/*.config.ts",
    //     "!**/*.dto.ts",
    //     "!**/*.input.ts",
    //     "!**/*.type.ts",
    //     "!**/*.entity.ts",
    //     "!main.ts",
    // ],

    coverageDirectory: "../coverage",
    coverageProvider: "v8",

    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },

    testEnvironment: "node",

    moduleNameMapper: {
        "^@domain/(.*)$": "<rootDir>/domain/$1",
        "^@application/(.*)$": "<rootDir>/application/$1",
        "^@infrastructure/(.*)$": "<rootDir>/infrastructure/$1",
        "^@presentation/(.*)$": "<rootDir>/presentation/$1",
    },

    clearMocks: true,
};

export default config;