# cnpmcore

## 如何使用

参考 [配置项](https://github.com/cnpm/cnpmcore/blob/master/config/config.default.ts) 编写 `config.prod.js` 并挂载到容器中 `/opt/cnpmcore/config/config.prod.js`

## 示例

```js
module.exports = {
  keys: 'xxxxxxxxxxxxxxxxxxx',
  cluster: {
    listen: {
      hostname: '0.0.0.0',
    },
  },
  cnpmcore: {
    registry: 'https://xxxxxxxxxxxxxxxx',
    enableWebAuthn: true,
    sourceRegistry: 'https://registry.npmmirror.com',
    sourceRegistryIsCNpm: true,
    syncMode: 'proxy',
    changesStreamRegistry: 'https://registry.npmmirror.com/_changes',
    enableElasticsearch: false,
    redirectNotFound: false,
    admins: {
      admin: 'npm@xxxxxxxxx.com',
    }
  },
  security: {
    csrf: {
      enable: false,
    },
  },
  orm: {
    database: 'cnpmcore',
    host: '127.0.0.1',
    port: 3306,
    user: 'cnpmcore',
    password: 'password',
  },
  redis: {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: 'password',
      db: 0,
    },
  },
  nfs: {
    client: new (require('s3-cnpmcore'))({
      region: 'default',
      endpoint: 'https://oss.endpoint.com',
      credentials: {
        accessKeyId: 'ak',
        secretAccessKey: 'sk',
      },
      bucket: 'bucket',
      forcePathStyle: true,
      disableURL: false,
    }),
  },
  logger: {
    dir: '/var/log/cnpmcore',
  },
};
```
