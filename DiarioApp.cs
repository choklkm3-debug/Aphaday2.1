using System;
using System.Drawing;
using System.IO;
using System.Net;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using System.Runtime.InteropServices;

[assembly: AssemblyTitle("Aphaday")]
[assembly: AssemblyProduct("Aphaday - Organizacao Pessoal")]
[assembly: AssemblyVersion("1.0.0.0")]

namespace DiarioApp
{
    static class Program
    {
        static HttpListener listener;
        static string appRoot;
        static int port = 8080;

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            appRoot = Path.GetDirectoryName(Application.ExecutablePath);

            // Inicia servidor HTTP
            StartServer();

            Application.Run(new MainForm());

            // Para o servidor ao fechar
            try { if (listener != null) listener.Stop(); } catch { }
        }

        static void StartServer()
        {
            // Tenta portas ate encontrar uma livre
            for (int p = 8080; p < 8100; p++)
            {
                try
                {
                    listener = new HttpListener();
                    listener.Prefixes.Add("http://localhost:" + p + "/");
                    listener.Start();
                    port = p;
                    break;
                }
                catch
                {
                    listener = null;
                }
            }

            if (listener == null) return;

            Thread t = new Thread(ServeRequests);
            t.IsBackground = true;
            t.Start();
        }

        static void ServeRequests()
        {
            var mimeMap = new System.Collections.Generic.Dictionary<string, string>
            {
                {".html", "text/html; charset=utf-8"},
                {".css",  "text/css; charset=utf-8"},
                {".js",   "application/javascript; charset=utf-8"},
                {".json", "application/json; charset=utf-8"},
                {".png",  "image/png"},
                {".svg",  "image/svg+xml"},
                {".ico",  "image/x-icon"},
            };

            while (listener != null && listener.IsListening)
            {
                HttpListenerContext ctx;
                try { ctx = listener.GetContext(); }
                catch { break; }

                string urlPath = ctx.Request.Url.LocalPath;
                if (urlPath == "/") urlPath = "/index.html";

                string filePath = Path.Combine(appRoot, urlPath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

                try
                {
                    if (File.Exists(filePath))
                    {
                        byte[] bytes = File.ReadAllBytes(filePath);
                        string ext = Path.GetExtension(filePath).ToLower();
                        string ct = mimeMap.ContainsKey(ext) ? mimeMap[ext] : "application/octet-stream";
                        ctx.Response.ContentType = ct;
                        ctx.Response.ContentLength64 = bytes.Length;
                        ctx.Response.OutputStream.Write(bytes, 0, bytes.Length);
                    }
                    else
                    {
                        ctx.Response.StatusCode = 404;
                        byte[] body = Encoding.UTF8.GetBytes("404 Not Found");
                        ctx.Response.OutputStream.Write(body, 0, body.Length);
                    }
                }
                catch { }
                finally { try { ctx.Response.OutputStream.Close(); } catch { } }
            }
        }

        public static int Port { get { return port; } }
    }

    class MainForm : Form
    {
        WebBrowser browser;

        public MainForm()
        {
            this.Text = "Aphaday";
            this.Size = new Size(1100, 720);
            this.MinimumSize = new Size(420, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Icon = CreateIcon();

            // Remove bordas extras
            this.BackColor = Color.FromArgb(26, 26, 26);

            browser = new WebBrowser();
            browser.Dock = DockStyle.Fill;
            browser.ScrollBarsEnabled = false;
            browser.ScriptErrorsSuppressed = true;
            browser.IsWebBrowserContextMenuEnabled = false;
            browser.WebBrowserShortcutsEnabled = false;

            this.Controls.Add(browser);

            // Aguarda servidor iniciar
            Thread.Sleep(300);
            browser.Navigate("http://localhost:" + Program.Port + "/index.html");
        }

        Icon CreateIcon()
        {
            try
            {
                Bitmap bmp = new Bitmap(32, 32);
                Graphics g = Graphics.FromImage(bmp);
                g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

                var bg = Color.FromArgb(26, 26, 26);
                g.FillRectangle(new SolidBrush(bg), 0, 0, 32, 32);

                var font = new Font("Segoe UI", 18, FontStyle.Bold);
                var brush = new SolidBrush(Color.FromArgb(247, 247, 245));
                var sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
                g.DrawString("d", font, brush, new RectangleF(0, 0, 32, 32), sf);
                g.Dispose();

                IntPtr hIcon = bmp.GetHicon();
                return Icon.FromHandle(hIcon);
            }
            catch { return SystemIcons.Application; }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            browser.Navigate("about:blank");
            base.OnFormClosing(e);
        }
    }
}
