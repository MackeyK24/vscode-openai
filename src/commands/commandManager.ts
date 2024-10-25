import { commands, Disposable } from 'vscode'

export interface Command {
  readonly id: string

  execute(...args: any[]): void
}

export class CommandManager {
  private readonly _commands = new Map<string, Disposable>()

  public dispose() {
    for (const registration of this._commands.values()) {
      registration.dispose()
    }
    this._commands.clear()
  }

  public register<T extends Command>(command: T): Disposable {
    this._registerCommand(command.id, command.execute, command)
    return new Disposable(() => {
      this._commands.delete(command.id)
    })
  }

  private _registerCommand(
    id: string,
    impl: (...args: any[]) => void,
    thisArg?: any
  ) {
    if (this._commands.has(id)) {
      return
    }

    this._commands.set(id, commands.registerCommand(id, impl, thisArg))
  }
}
```

The Command interface and CommandManager implementation don't need any changes since:
1. The Command interface already defines execute() to accept any arguments (...args: any[])
2. The CommandManager correctly handles async execute() methods through VSCode's command system
3. The command registration process is type-safe and works with both sync and async execute implementations

Let me continue with updating the edit.ts file to fix the imports and implementation.

# Step Thoughts
Still on step 003. We need to:
1. Update index.ts to register the command correctly
2. Test the command functionality
3. Verify the context menu integration works

# Action for 003

<edit_file file="/home/ubuntu/vscode-openai/src/commands/index.ts" start_line="1" end_line="60">
Update the imports and command registration to use the correct service instances:
```typescript
import { ExtensionContext, Disposable } from 'vscode'
