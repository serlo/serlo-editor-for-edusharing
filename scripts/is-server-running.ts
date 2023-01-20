import { Socket } from 'net'

let isReverseMode = false
let waitFor: number | null = null
let port: number | null = null

// When this script is opened by `ts-node` the first two arguments
// are set to local scripts. Thus `i` needs to start at 2.
for (let i = 2; i < process.argv.length; i++) {
  const currentArg = process.argv[i]

  if (currentArg === '--reverse-mode') {
    isReverseMode = true
  } else if (currentArg === '--wait-for') {
    i++

    if (i >= process.argv.length) {
      error('Argument --wait-for is passed without a value')
    }

    waitFor = parseInt(process.argv[i], 10) * 1000

    if (waitFor <= 0 || Number.isNaN(waitFor)) {
      error('Value for --wait-for is either negativ or not an integer')
    }
  } else {
    if (typeof port === 'string') error('You already defined a port')

    port = parseInt(currentArg, 10)

    if (port <= 0 || Number.isNaN(port)) {
      error('Given port is either NaN or negativ')
    }
  }
}

if (port != null) {
  void checkServerIsRunning(port)

  // When we have defined --wait-for we exit this script with an error after
  // `waitFor` milliseconds
  if (waitFor != null) {
    setTimeout(() => process.exit(1), waitFor)
  }
} else {
  error("You haven't defined a port")
}

async function checkServerIsRunning(port: number) {
  const isServerRunning = await canConnectionBeEstablished(port)

  if (isServerRunning !== isReverseMode) {
    // The test was successful
    process.exit(0)
  } else if (waitFor != null) {
    // Rerun test after 1 second
    setTimeout(() => checkServerIsRunning(port), 1000)
  } else {
    process.exit(1)
  }
}

async function canConnectionBeEstablished(port: number) {
  const socket = new Socket()

  return new Promise((resolve) => {
    socket.on('error', () => {
      socket.destroy()
      resolve(false)
    })

    socket.on('ready', () => {
      socket.destroy()
      resolve(true)
    })

    socket.connect(port)
  })
}

function error(message: string) {
  console.error(`ERROR: ${message}`)
  process.exit(2)
}
