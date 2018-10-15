# Detection-In-Angular-React

## Angular和React中的变更检测

### _感知变更惟一的方法是随之起舞_

> 变更检测机制存在于任何一个web应用中，并是大部分流行web框架中的重要组成部分

> 可能在开发应用时变更检测机制并没有展示在代码上，但是事实上变更检测潜伏在应用的某个位置

> 个人认为变更检测是架构中最重要的部分，因为它负责DOM更新等可见的部分

> 每一个有抱负的架构师都应该对这个机制有着良好的理解,因为变更检测显著地影响了应用程序的表现

> 本文中首先会介绍变化检测，然后将实现一个非常基本的变化检测机制，一旦明确了变化检测的本质，将深入了解它在Angular和React中的实现方式

### 什么是变更检测

> 变更检测是用于跟踪应用程序状态并将更新的状态渲染到屏幕上的一种机制，这种机制将会确保用户界面始终与程序的内部状态保持同步

> 亦即变更检测存在两个重要的部分

- 跟踪变更
- 渲染变更

### 渲染

> 在一个应用中，渲染的过程是获取程序的内部状态并将其投影到屏幕上的过程

> 在Web开发中采用对象和数组之类的数据结构并最终以图像，按钮和其他可视元素的形式呈现该数据的DOM表示

> 虽然有些时候渲染的逻辑可能并不是直截了当，但是大多数时候渲染还是很直白的

> 但是当数据随着时间发生变化后事情逐渐开始变得复杂起来了

- 如今的Web应用程序是交互式的，这意味着应用程序状态可以随着用户的交互而随时更改
- 也可能是因为后端服务的数据发生了变化，而前端作为客户端获取了这些更新
- 当状态发生改变时，检测和反映出这些改变就非常有必要了

#### 说明太抽象，例子来帮忙

> 假设想要实现一个评级部件，屏幕上的实心数反映了当前的评级

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
 
> 当更新部件的状态时需要在屏幕上反映这些更改，期待的DOM结构为

```html
<ul class="ratings">
    <li class="star solid"></li>
    <li class="star solid"></li>
    <li class="star solid"></li>
    <li class="star outline"></li>
    <li class="star outline"></li>
</ul>
```

> 使用CSS类solid和outline来渲染相应的星形图标,窗口部件初始化为所有列表项作为星形外轮廓而随着状态的改变，相应的列表项变为实心星形的样式

> 在部件初始化的过程中，我们需要创造所有需要的DOM节点

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

> 为了实现变更检测，当rating属性的值发生变化，应用程序应当接收到通知

> 在此使用Javascrpt的`setter`属性实现变更检测的流程

> 为rating属性定义一个`setter`，并在其值发生变化时触发更新方法，通过交换列表项上的CSS类来执行DOM更新

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

> 截止到目前为止可能为了实现变更检测所付出的代码量还是可以接受的，但当遇到更复杂的功能`有多个列表和条件逻辑来显示或隐藏一些视觉元素`,代码量和复杂性将急剧增长,这是不可接受的状况

> 理想情况下，在日常开发中开发者希望专注于应用程序逻辑而不是重复地撰写类似的代码

> 应该有一个`其他东西`处理状态跟踪和屏幕更新的部分，而`框架就是这个其他东西`
