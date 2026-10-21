import json
import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

class NoCacheHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?', 1)[0] == '/__cineverse_config':
            payload = json.dumps({'tmdbApiKey': os.environ.get('TMDB_API_KEY', '')}).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

if __name__ == '__main__':
    ThreadingHTTPServer(('0.0.0.0', 3000), NoCacheHandler).serve_forever()
