
module.exports = {
    bail: false,
    verbose: true,
    displayName: { name: 'serverless', color: 'magentaBright' },
    preset: 'ts-jest',
    transformIgnorePatterns: ['/node_modules/'],
    moduleFileExtensions: ['js', 'ts'],
}