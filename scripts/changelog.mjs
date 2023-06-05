import { readFile, writeFile } from "fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from 'url'
import { platform } from "node:os"
import { Msg } from "@eos-makeshift/msg"
import chalk from "chalk"
import * as semver from "semver"



const msgr = new Msg()
msgr.host = 'ChangeLogGen'
msgr.showTime = true

const log = msgr.getLevelLoggers()
const __dirname = dirname(fileURLToPath(import.meta.url))

log.info('Starting changelog generation...')
log.info('Loading changelog file - assuming .\/CHANGELOG.md')
const changelog = await readFile(join(__dirname, "../CHANGELOG.md"), "utf8")
let changelogLines = []


const regex = /^## \[([\d.]+)\] - (\d{4}-\d{2}-\d{2})$/m;
// const dateRegex = /(\d{4}-\d{2}-\d{2})/m

const currPlatform = platform()

let newlineChar = '\n'
if (currPlatform === 'win32') {
  newlineChar = '\r\n'
}

changelogLines = changelog.split(newlineChar)

let versionLine = {
  index: changelogLines.findIndex(line => regex.test(line)),
}

let newLineIndex = 0

const dateNow = new Date().toISOString().split('T')[0]
const newHeader = `## [${process.env.npm_package_version}] - ${dateNow}`

if (versionLine.index !== -1) {
  if (newHeader === changelogLines[versionLine.index]) {
    log.warn(`Changelog already has a header for this version: ${chalk.green(newHeader)}`)
    log.info('Exiting without doing anything...')
    process.exit(0)
  }
  versionLine.match = changelog.match(regex)
  versionLine.version = changelog.match(regex)[1]
  versionLine.line = changelog.match(regex)[0]
  newLineIndex = versionLine.index
} else {
  newLineIndex = changelogLines.length
}

const changelogLinesBeforeVersion = changelogLines.slice(0, newLineIndex)
const changelogLinesAfterVersion = changelogLines.slice(newLineIndex)

// console.log(changelogLinesBeforeVersion)
// console.log(changelogLinesAfterVersion)


const newLines = [
  newHeader,
  '',
  `### Added`,
  `### Changed`,
  `### Deprecated`,
  `### Removed`,
  `### Fixed`,
  `### Security`,
  ''
]
log.info(`Adding new heading to changelog: 
${chalk.green(newLines[0])}`)

const newChangeLog = [
  ...changelogLinesBeforeVersion,
  ...newLines,
  ...changelogLinesAfterVersion
].join(newlineChar)


log.info(`Success, new changelog generated:
${chalk.gray(changelogLinesBeforeVersion.join(newlineChar))}
${chalk.green(newLines.join(newlineChar))}
${chalk.gray(changelogLinesAfterVersion.join(newlineChar))}
`)

await writeFile(join(__dirname, "../CHANGELOG.md"), newChangeLog, "utf8")