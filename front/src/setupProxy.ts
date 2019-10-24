import proxy from 'http-proxy-middleware';

export const f = (app)=> {
  app.use(proxy('/api', { target: 'http://localhost:4000/' }));
};

export default f;