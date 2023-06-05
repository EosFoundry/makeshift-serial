import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * This function generated DeviceEvent fields from the descriptor file given.
 *
 * TODO: This function will be refactored into a typescript decorator format to
 * generate the events from the descriptor file during compile time instead of runtime.
 *  Note: use ts-morph to do this
 *
 * @param descriptorName 
 */
export function buildDeviceSensorEventsFromDescriptor(descriptorName) {
  let DeviceSensorEvents = {}

  try {
    const descriptorFileContents = readFileSync(
      join(__dirname, '..', 'hardware-descriptors', `${descriptorName}.json`),
      'utf8'
    )
    const Descriptor = JSON.parse(descriptorFileContents)

    const sensorFileContents = readFileSync(
      join(__dirname, '..', 'hardware-descriptors', 'sensors.json'),
      'utf8'
    )
    const SensorSchema = JSON.parse(sensorFileContents)

    Descriptor.sensors.forEach((sensor, index) => {
      for (const sensorType in SensorSchema) {
        if (sensor.types.includes(sensorType)) {
          if (typeof DeviceSensorEvents[sensorType] === 'undefined') {
            DeviceSensorEvents[sensorType] = []
          }
          const eventObject = {}
          const eventName = `sensor-${Descriptor.sensors[index].id}-${sensorType.toLowerCase()}`

          for (const event of SensorSchema[sensorType].events) {
            const eventLabel = event.toUpperCase()
            eventObject[eventLabel] = eventName + `-${event}`
          }

          eventObject.CHANGED = eventName + '-changed'

          DeviceSensorEvents[sensorType].push(eventObject)
        }
      }
    })

    console.log(Descriptor)
    console.log(DeviceSensorEvents)
    return DeviceSensorEvents
  } catch (e) {
    console.error(`Error reading file: ${e}`)
  }
}

function flattenEmitterApi(obj) {
  const ret = []
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      return obj[key]
    } else {
      const subArr = flattenEmitterApi(obj[key])
      if (Array.isArray(subArr)) {
        ret.push(...subArr)
      } else {
        ret.push(subArr)
      }
    }
  }
  return ret
}

const target = 'makeshift'
const SensorEvents = buildDeviceSensorEventsFromDescriptor(target)
const SensorEventsFlat = flattenEmitterApi(SensorEvents)

writeFileSync(
  join(__dirname, '../hardware-descriptors/generated/', `${target}-events.json`),
  JSON.stringify(SensorEvents, null, 2))

writeFileSync(
  join(__dirname, '../hardware-descriptors/generated/', `${target}-events-flat.json`),
  JSON.stringify(SensorEventsFlat, null, 2))