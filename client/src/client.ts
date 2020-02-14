import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
    let clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'erlang' }],
        synchronize: {
            fileEvents: [
                workspace.createFileSystemWatcher('**/rebar.config'),
                workspace.createFileSystemWatcher('**/rebar.lock')
            ]
        }
    };

    let serverPath = workspace.getConfiguration('erlang_ls').serverPath;
    if (serverPath === "") {
        serverPath = context.asAbsolutePath(
            path.join('erlang_ls', '_build', 'debug', 'bin', 'erlang_ls')
        );
    }

    let serverArgs = [serverPath, "--transport", "stdio"];
    let loggingLevel = workspace.getConfiguration('erlang_ls').loggingLevel;
    if (loggingLevel !== "") {
        serverArgs.push("--log-level", loggingLevel);
    }

    let serverOptions: ServerOptions = {
        command: 'escript',
        args: serverArgs,
        transport: TransportKind.stdio
    };

    client = new LanguageClient(
        'erlang_ls',
        'Erlang LS',
        serverOptions,
        clientOptions
    );

    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
