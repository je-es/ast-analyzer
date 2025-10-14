// IdGenerator.ts - Simple ID generation utility.
//
// Developed with ❤️ by Maysara.



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class IdGenerator {

        private counter = 0;

        next(): number {
            return ++this.counter;
        }

        reset(): void {
            this.counter = 0;
        }

        current(): number {
            return this.counter;
        }
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝