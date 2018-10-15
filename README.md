# Detection-In-Angular-React

## Angular和React中的变更检测

### _感知变更惟一的方法是随之起舞_

> 变更检测机制存在于任何一个web应用中,并是大部分流行web框架中的重要组成部分

> 可能在开发应用时变更检测机制并没有展示在代码上,但是事实上变更检测潜伏在应用的某个位置

> 个人认为变更检测是架构中最重要的部分,因为它负责DOM更新等可见的部分

> 每一个有抱负的架构师都应该对这个机制有着良好的理解,因为变更检测显著地影响了应用程序的表现

> 本文中首先会介绍变化检测,然后将实现一个非常基本的变化检测机制,一旦明确了变化检测的本质,将深入了解它在Angular和React中的实现方式

### 什么是变更检测

> 变更检测是用于跟踪应用程序状态并将更新的状态渲染到屏幕上的一种机制,这种机制将会确保用户界面始终与程序的内部状态保持同步

> 亦即变更检测存在两个重要的部分

- 跟踪变更
- 渲染变更

### 渲染

> 在一个应用中,渲染的过程是获取程序的内部状态并将其投影到屏幕上的过程

> 在Web开发中采用对象和数组之类的数据结构并最终以图像,按钮和其他可视元素的形式呈现该数据的DOM表示

> 虽然有些时候渲染的逻辑可能并不是直截了当,但是大多数时候渲染还是很直白的

> 但是当数据随着时间发生变化后事情逐渐开始变得复杂起来了

- 如今的Web应用程序是交互式的,这意味着应用程序状态可以随着用户的交互而随时更改
- 也可能是因为后端服务的数据发生了变化,而前端作为客户端获取了这些更新
- 当状态发生改变时,检测和反映出这些改变就非常有必要了

#### 说明太抽象,例子来帮忙

> 假设想要实现一个评级部件,屏幕上的实心数反映了当前的评级

> 此交互式窗口部件允许用户单击任何星形并设置新的评级

![rating widget](./assets/1.gif)

> 为了跟踪评级的状态需要将当前的值存储在应用的某处

> 为此定义私有属性`_rating`作为评级的状态

```javascript
export class RatingsComponent {
    constructor() {
        this._rating = 1;
    }
}
```
 
> 当更新部件的状态时需要在屏幕上反映这些更改,期待的DOM结构为

```html
<ul class="ratings">
    <li class="star solid"></li>
    <li class="star solid"></li>
    <li class="star solid"></li>
    <li class="star outline"></li>
    <li class="star outline"></li>
</ul>
```

> 使用CSS类solid和outline来渲染相应的星形图标,窗口部件初始化为所有列表项作为星形外轮廓而随着状态的改变,相应的列表项变为实心星形的样式

> 在部件初始化的过程中,我们需要创造所有需要的DOM节点

```javascript
export class RatingsComponent {
    //...
    // container is a Dom node
    init(container) {
        this.list = document.createElement('ul');
        this.list.classList.add('ratings');
        this.list.addEventListener('click', (event) => {
            this.rating = event.target.dataset.value;
        });

        this.elements = [1, 2, 3, 4, 5].map((value) => {
            const li = document.createElement('li');
            li.classList.add('star', 'outline');
            li.dataset.value = value;
            this.list.appendChild(li);
            return li;
        });

        container.appendChild(this.list);
    }
}
```

> 上述代码中创建了一个包含个体的无序列表。然后我们将CSS类添加到列表项上并为之创建`click`事件的监听器

##### 触发变更检测

> 为了实现变更检测,当rating属性的值发生变化,应用程序应当接收到通知

> 在此使用Javascrpt的`setter`属性实现变更检测的流程

> 为rating属性定义一个`setter`,并在其值发生变化时触发更新方法,通过交换列表项上的CSS类来执行DOM更新

```javascript
export class RatingsComponent {
    //...
    set rating(v) {
        this._rating = v;

        // 触发DOM更新方法
        this.updateRatings();
    }

    get rating() {
        return this._rating;
    }

    updateRatings() {
        this.elements.forEach((element, index) => {
            // 交换列表项的CSS类
            element.classList.toggle('solid', this.rating > index);
            element.classList.toggle('outline', this.rating <= index);
        });
    }
}
```

[sample code](./basic-example/index.js)

> 截止到目前为止可能为了实现变更检测所付出的代码量还是可以接受的,但当遇到更复杂的功能`有多个列表和条件逻辑来显示或隐藏一些视觉元素`,代码量和复杂性将急剧增长,这是不可接受的状况

> 理想情况下,在日常开发中开发者希望专注于应用程序逻辑而不是重复地撰写类似的代码

> 应该有一个`其他东西`处理状态跟踪和屏幕更新的部分,而`框架就是这个其他东西`

### 框架

> 框架负责应用程序的内部状态和用户界面之间的同步,有效地进行状态跟踪和DOM更新

> 下述是在Angular和React中实现相同的部件的模板,从用户对UI的角度来看,模板是组件配置中最重要的部分

- Angular

```html
<ul class="rating" (click)="handleClick($event)">
    <li [className]="'star ' + (rating > 0 ? 'solid' : 'outline')"></li>
    <li [className]="'star ' + (rating > 1 ? 'solid' : 'outline')"></li>
    <li [className]="'star ' + (rating > 2 ? 'solid' : 'outline')"></li>
    <li [className]="'star ' + (rating > 3 ? 'solid' : 'outline')"></li>
    <li [className]="'star ' + (rating > 4 ? 'solid' : 'outline')"></li>
</ul>
```

- React

```jsx
<ul className="rating" onClick={handleClick}>
    <li className={'star ' + (rating > 0 ? 'solid' : 'outline')}></li>
    <li className={'star ' + (rating > 1 ? 'solid' : 'outline')}></li>
    <li className={'star ' + (rating > 2 ? 'solid' : 'outline')}></li>
    <li className={'star ' + (rating > 3 ? 'solid' : 'outline')}></li>
    <li className={'star ' + (rating > 4 ? 'solid' : 'outline')}></li>
</ul>
```

> 虽然上述模板有些细微的差异,但是`使用表达式作为DOM元素属性的值`的理念是相同的

> 上述代码中,DOM属性`className`取决于组件的`rating`属性,当`rating`属性发生变化时,表达式都会重新计算

> 亦即,如果变更被检测到了,`className`属性将会被更新

> 值得注意的是,事件监听器并不是React或Angular中的变更检测的一部分,事件监听通常会触发变更检测,但其本身不是过程一部分

### 变更检测在框架中的应用

> 虽然`使用表达式作为DOM元素属性值`的想法在Angular和React中都是相同的,但二者的底层机制却完全不同

#### 对于Angular而言

> 当编译器分析模板时,首先会标识与DOM元素相关联的组件的属性,并对于每个这样的关联,编译器以指示(instructions)的形式创建绑定

> 绑定是Angular变更检测中的核心部分,它定义了组件属性`通常包含在某个表达式中`与DOM元素属性之间的关联

> 一旦创建了绑定ngular就不作用于于模板,`变更检测机制执行处理绑定的指令`,这些指令的作用是检查`具有组件属性的表达式的值`是否已更改,并在必要时执行DOM更新

> 上述的例子中模板的`rating属性`通过表达式绑定到`className属性`

```
[className]="'star ' + ((ctx.rating > 0) ? 'solid' : 'outline')"
```

> 对于模板的这一部分编译器生成用于`设置绑定`,`执行脏检查`和`更新DOM`的指示,比如:

```typescript
if (initialization) {
    elementStart(0, 'ul');
        ...
        elementStart(1, 'li', ...);

        // 给className属性设置绑定
        elementStyling();
        elementEnd();
        ...
    elementEnd();
}

if (changeDetection) {

    // 检查表达式的值是否发生了改变
    // 如果表达式的值发生了改变则将绑定设定为污染并更新dom
    elementStylingMap(1, ('star ' + ((ctx.rating > 0) ? 'solid' : 'outline')));
    elementStylingApply(1);
    ...
}
```

> 值得注意的是,上述代码中的绑定指示是基于`Ivy的新编译器`的输出,以前版本的Angular使用完全相同的绑定和脏检查的机制只是实现略有不同

> 假设Angular为className创建了绑定,绑定的当前值如下:

```typescript
{ dirty: false, value: 'outline' }
```

> 当`rating`属性发生变更时,Angular会运行变更检测并处理指令

> 首先指令会获取计算表达式的结果,并使用它与绑定存储的先前值进行比较

> 这就是`脏检查`这个名称的来源 - 如果值已更改,则更新当前值并将此绑定标记为脏

```typescript
{ dirty: true, value: 'solid' }
```

> 后续指令检查绑定是否为脏,如果是,则使用新值更新DOM,而在上述例子中,它将更新列表项的className属性

##### _处理执行脏检查和更新DOM的相关部分的绑定是Angular中变更检测的核心操作_

#### 对于React而言

> React使用截然不同的方式实现变更检测

> React中变更检测机制的核心部分是比较`Virtual DOM`

> 所有React组件都实现了`返回JSX模板`的`render方法`,并且模板被编译成`React.createElement`的函数调用

```javascript
const el = React.createElement;

export class RatingComponent extends ReactComponent {
    //...
    render() {
        return el('ul', { className: 'ratings', onclick: handleClick}, [
                 el('li', { className: 'star ' + (rating > 0 ? 'solid' : 'outline') }),
                    ...
        ]);
    }
}
```

> 每一个`React.createElement`函数都创建一个名为`Virtual DOM节点`的数据结构

> 事实上这个部分没有什么特别只是一个简单的JavaScript对象描述了`一个HTML元素及其属性和子元素`

> 但是当多次调用`React.createElement`函数后,它们共同创建了一个`Virtual DOM树`

```javascript
export class RatingComponent extends ReactComponent {
    ...
    render() {
        return {
            tagName: 'UL',
            properties: {className: 'ratings'},
            children: [
                {tagName: 'LI', properties: {className: 'outline'}},
                ...
            ]
        }
    }
}
```

> 具有组件属性的表达式将会在`render`方法被调用时重新计算评估,而`Virtual DOM节点属性`包含已计算表达式的结果

> 假设在上述的例子中,`rating属性`的值为0.这意味着:

```javascript
{ className: rating > 0 ? 'solid' : 'outline' }
```

> 计算结果为`outline`并作为`Virtual Dom`中`className`属性的值

> 基于当前的`Virtual Dom`树,React将会创建拥有CSS类为`outline`的列表元素

> 现在`rating`属性更新为1,则表达式为将会修改`className`属性为`solid`,此时React运行变更检测,执行`render`方法执行返回一个新的`Virtul Dom`树(`className`属性为`solid`)

> 需要注意的是,在每个变更检测周期中`render`方法都会被调用,这意味着每次调用该函数时,它都能返回完全不同的Virtual DOM树

> 所以现在有两个Virtual DOM数据结构,之后在两个`Virtual DOM`上运行区分算法,以获取它们之间的一组更改

[virtual dom](./assets/2.png)

> 一旦找到差异,算法就会生成一个补丁来更新相应的DOM节点

> 在示例中,补丁将使用新`Virtual DOM`中的`solid`值更新`className属性`, 之后这个更新版本的`Virtual DOM`将用于下一个变更检测周期的比较

##### 总结

`从组件中获取新的Virtual DOM树,将其与Virtual Dom树的先前版本进行比较,生成修补以更新DOM的相关部分并执行更新是React中变更检测的核心操作`

#### 变更检测的执行时间点

> 为了深入理解变更检测,还需要知晓何时`React执行render方法`和`Angular执行处理绑定的指令`

> 按照逻辑而言,一般有两种方式触发变更检测

1. 明确告诉框架某些`事情,属性,对象`发生了变化,或者`有可能发生变化`,因此它应该运行变更检测
2. 依靠框架来知晓何时有可能发生变化并`自动运行变更检测`

##### React只有一种方式

> 在React中总是通过调用`setState函数`手动初始化变更检测过程,没有自动触发变更检测的方式

```javascript
export class RatingComponent extends React.Component {
    //...
    handleClick(event) {
        this.setState({rating: Number(event.target.dataset.value)})
    };
}
```

> 每个变更检测周期都从调用`setState函数`开始
> 值得注意的是，`setState函数`是一个请求也可以理解为一个异步函数，它并不会立刻更新组件
> 在React中，为了效率等原因可能会延迟这个过程在后续的`VM turn`中执行之

##### 在Angular中拥有两种方式

> 可以使用`Change Detector service`手动执行变更检测

```typescript
class RatingWidget {
    constructor(private cd: changeDetector) {
    }

    handleClick(event) {
        this.rating = Number(event.target.dataset.value);
        this.cd.detectChanges();
    };
}
```

> 也可以依靠框架自动触发变化检测

```typescript
class RatingWidget {
    handleClick(event) {
        this.rating = Number(event.target.dataset.value);
    };
}
```

> 但是也有随之而来的疑问,Angular作为框架如何知晓何时执行变更检测

1. 使用Angular提供的绑定机制绑定模板中的UI事件用以知晓所有的UI事件监听器,这意味着它可以拦截事件侦听器并在应用程序代码完成执行后安排 变更检测运行
2. 上述的拦截机制是一个很棒的理念但是并不能应用于所有的异步事件(比如setTimeout事件和XHR事件)
3. 为了解决2中存在的缺陷,Angular使用`zone.js`库修补分配浏览器中的所有异步事件,确保可以在发生特定事件时通知Angular,实际效果与UI事件类似,Angular可以等到应用程序代码完成执行并自动启动变更检测

