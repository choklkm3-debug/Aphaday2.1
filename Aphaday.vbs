Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strScriptPath = WScript.ScriptFullName
strPath = objFSO.GetParentFolderName(strScriptPath)
strBatFile = strPath & "\Aphaday-App.bat"

REM Inicia o servidor
objShell.Run """" & strBatFile & """", 1

REM Aguarda 3 segundos
WScript.Sleep 3000

REM Abre navegador
objShell.Run "start http://localhost:8080", 0
