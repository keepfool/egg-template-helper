# egg-template-helper

## Setup an egg project

install `egg-init` globally

```bash
  npm i egg-init -g
```

### setup a TypeScript based project

```bash
npx egg-init --type=ts projectName
cd projectName && npm i
npm run dev
```

### setup a JavaScript based project

```bash
egg-init --type simple projectName
cd projectName && npm i
npm run dev
```

For further details, please refer to [https://github.com/eggjs/egg-init]()

## Install

```bash
  npm install egg-template-helper -g
```

or

```bash
  yarn global add egg-template-helper
```

## Usage

```bash
$ eth -h

  Usage: eth [commands] [options]

  Options:
    -v, --version            output the version number
    -h, --help               output usage information

  Commands:

    new [name] [options]     新建egg文件
    delete [name] [options]  删除egg文件
    rename [name] [options]  重命名egg文件
```

### `eth new`

create files by the [name] and a specified type.

#### New Options

| name | type | description |
| --- | --- | --- | --- |
| category | string | new file category |
| test | boolean | whether append test for controller / service / model  |

Available category

- `default`: will create controller, service and model.
- `controller`: will create a controller.
- `service`: will create a service.
- `model`: will create a model, the model depends on `mongoose`.

#### create controller / service / model

```bash
  eth new user --category default
```

or

```bash
  eth new user -c default
```

**Actually the [name] parameter is a path relative to `app/controller` / `app/service` / `app/model`**

In this example, it will create `app/controller/user.ts`, `app/model/user.ts`, `app/service/user.ts`.

#### create a sub directory controller / service / model

```bash
  eth new permission/role --category default
```

or

```bash
  eth new permission/role -c default
```

It will create `app/controller/permission/role.ts`, `app/model/permission/role.ts`, `app/service/permission/role.ts`.

### `eth delete`

delete files associated with the [name]

```bash
  eth delete user
```

It will delete `app/controller/user.ts`, `app/model/user.ts`, `app/service/user.ts`.

### `eth rename`

#### Rename Options

| name | type | description |
| --- | --- | --- |
| newPath | string | new path |

rename files associated with the [name]

```bash
  eth rename user -n masterUser
```

or

```bash
  eth rename user -newPath masterUser
```

It will rename `app/controller/user.ts`, `app/model/user.ts`, `app/service/user.ts` to `app/controller/masterUser.ts`, `app/model/masterUser.ts`, `app/service/masterUser.ts`

**It will also change the file content!!!**

Once `user` renamed to `masterUser`, the `app/controller/masterUser.ts` content is changed.

```typescript
import { Controller } from 'egg'

/**
 * MasterUser Controller
 *
 * @export
 * @class MasterUserController
 * @extends {Controller}
 */
export default class MasterUserController extends Controller {
}
```

## Customizations

You can setup your own templates.

### eth.config.json

create an `eth.config.json` file under the project root.

| name | type | default | description |
| --- | --- | --- | --- |
| ext | string | ".ts" | file extenision, you can specify `ext` to ".js" if you use JavaScript to develop egg project |
| templateDir | string | "" | custom template path, relative to the project root |
| execEts | boolean | true | execute `egg-ts-helper` after command executed. It will take effect when `ext` is ".ts" |
| renameContent | boolean | true | rewrite file content when executing `rename` command  |
| customData | object | {} | pass custom data to custom template when executing `new` command  |

### Example

Let's customize a template and inject an author name by setting customData.

eth.config.json

```json
{
  "ext": ".ts",
  "templateDir": "template",
  "execEts": true,
  "renameContent": false,
  "customData": {
    "Author": "Dada"
  }
}
```

directory structure

```
egg-showcase
  ├── node_modules
  └── app
      ├── controller
      ├── model
      ├── service
      └── router.ts
  ├── template                          template directory
  |   ├── controller.test.tpl           controller test template
  |   ├── controller.tpl                controller template
  |   ├── model.tpl                     model template
  |   ├── service.test.tpl              service testtemplate
  └── └── service.tpl                   service template
```

### template/comtroller.tpl

```typescript
import { Controller } from 'egg'

/**
 * <%=pascalCaseName%> Controller
 * 
 * @author <%=Author%>
 * @export
 * @class <%=pascalCaseName%>Controller
 * @extends {Controller}
 */
export default class <%=pascalCaseName%>Controller extends Controller {
}
```

There are four built in variables: `name`, `pascalCaseName`, `testName`, `modelTestRootRelative`

### execute `new` command

```bash
  eth new user -c default
```

The content in `app/controller/user.ts` will like this:

```typescript
import { Controller } from 'egg'

/**
 * User Controller
 *
 * @author Dada
 * @export
 * @class UserController
 * @extends {Controller}
 */
export default class UserController extends Controller {
}
```
