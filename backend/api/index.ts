let app: any;
let initError: any;




try {
  app = require('../src/server').default;
} catch (error) {
  initError = error;
  console.error("Initialization Error:", error);
}

// Export for Vercel Serverless Function
export default function (req: any, res: any) {
  if (initError) {
    return res.status(500).json({
      success: false,
      message: 'Vercel Initialization Error',
      error: initError.message,
      stack: initError.stack
    });
  }
  return app(req, res);
};
