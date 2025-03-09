import subprocess
import webbrowser
import time
import os
import socket

# 获取脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))

def find_available_port(start_port=8000):
    port = start_port
    while True:
        try:
            # 尝试绑定到端口
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('127.0.0.1', port))
                return port
        except OSError:
            # 端口已被占用，尝试下一个端口
            port += 1

def start():
    port = find_available_port()
    # 启动 HTTP 服务器
    server_process = subprocess.Popen(
        ['python', '-m', 'http.server', str(port)],
        cwd=script_dir,
        stdout=subprocess.DEVNULL,  # 忽略标准输出
        stderr=subprocess.STDOUT    # 将错误输出重定向到标准输出
    )
    print(f"HTTP 服务器已启动，端口：{port}")

    # 等待 2 秒，确保服务器启动
    time.sleep(2)

    # 打开浏览器
    webbrowser.open(f'http://127.0.0.1:{port}/first_page.html')

    # 脚本结束，服务器继续运行
    input("按回车键关闭服务器")
    server_process.terminate()

if __name__ == '__main__':
    start()
