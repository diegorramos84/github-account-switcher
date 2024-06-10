// Add the interface at the top of your extension.ts file
interface AccountConfig {
  username: string;
  userEmail: string;
  sshKey: string;
  ghUser: string;
}

import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
  let personalCommand = vscode.commands.registerCommand('extension.switchToPersonalAccount', () => {
    switchAccount('personal');
  });

  let professionalCommand = vscode.commands.registerCommand('extension.switchToProfessionalAccount', () => {
    switchAccount('professional');
  });

  context.subscriptions.push(personalCommand);
  context.subscriptions.push(professionalCommand);
}

function switchAccount(account: string) {
  const config = vscode.workspace.getConfiguration('githubAccountSwitcher');
  const userConfig = account === 'personal' 
    ? config.get<AccountConfig>('personalAccount') 
    : config.get<AccountConfig>('professionalAccount');

  if (!userConfig) {
    vscode.window.showErrorMessage(`Configuration for ${account} account is missing.`);
    return;
  }

  const { username, userEmail, sshKey, ghUser } = userConfig;

  if (!username || !userEmail || !sshKey || !ghUser) {
    vscode.window.showErrorMessage(`Missing configuration for ${account} account.`);
    return;
  }

  const command = `
    git config --global user.name "${username}" &&
    git config --global user.email "${userEmail}" &&
    git config --global core.sshCommand "ssh -i ${sshKey}" &&
    gh auth switch --hostname github.com --user "${ghUser}"
  `;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      vscode.window.showErrorMessage(`Failed to switch account: ${error.message}`);
    } else {
      vscode.window.showInformationMessage(`Switched to ${account} account`);
    }
  });
}

export function deactivate() {}
