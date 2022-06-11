# ITerm2 主题配置

### 最终效果
![最终效果](../assets/iterm%E6%9C%80%E7%BB%88%E6%95%88%E6%9E%9C.jpg)

### 第一步：
1. 克隆[配置文件仓库](https://github.com/chongqiangchen/iterm-config/tree/master)
2. 打开 Iterm2 -> Preference -> Profiles -> Color -> Color Presets -> import。导入material-design-colors.itermcolors文件，并选择
> 注意，这边还需要一点改变： Color中一栏选择为ANSI Colors的black颜色改为4b585e，后面配置需要这个颜色。
3. 安装 iterm-config 下的两个 .ttf 字体文件（双击安装）
4. 打开 Iterm2 -> Preference -> Profiles -> Text 按照图中的设置

![字体配置](../assets/text%E9%85%8D%E7%BD%AE.jpg)
>注意，如果需要透明度或者背景可以在Iterm2 -> Preference -> Profiles -> Window中进行调节设置

### 第二步
1. 克隆[字体图标仓库](https://github.com/gabrielelana/awesome-terminal-fonts)
2. 安装 awesome-terminal-fonts/build 下面5个 .ttf 文件

### 第三步
1. 在 ~/.oh-my-zsh/custom/plugins/ 目录下克隆[语法高亮仓库](https://github.com/zsh-users/zsh-syntax-highlighting)
2. 进入 zshrc
```sh
cd
vim .zshrc
```
3. 配置 zshrc

确认一下配置是否存在，不存在或不一样请加入这些或更改（**注意一下 awesome-terminal-fonts 目录的位置**）：
```sh
export ZSH=$HOME/.oh-my-zsh

source $HOME/awesome-terminal-fonts/build/*.sh
source $HOME/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

POWERLEVEL9K_MODE='nerdfont-complete'

ZSH_THEME="powerlevel9k/powerlevel9k"

source $ZSH/oh-my-zsh.sh
```

引入powerlevel9k的设置：

```sh
POWERLEVEL9K_OS_ICON_BACKGROUND='black'

POWERLEVEL9K_CONTEXT_TEMPLATE='%n'
POWERLEVEL9K_CONTEXT_DEFAULT_BACKGROUND='black'
POWERLEVEL9K_CONTEXT_DEFAULT_FOREGROUND='white'
POWERLEVEL9K_MULTILINE_FIRST_PROMPT_PREFIX='\u256D\u2500'
POWERLEVEL9K_PROMPT_ON_NEWLINE=true
POWERLEVEL9K_MULTILINE_LAST_PROMPT_PREFIX="%F{014}\u2570%F{cyan}>%F{073}>%F{101}>%f "
POWERLEVEL9K_VCS_MODIFIED_BACKGROUND='yellow'
POWERLEVEL9K_VCS_UNTRACKED_BACKGROUND='yellow'
POWERLEVEL9K_VCS_UNTRACKED_ICON='?'

POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(os_icon context dir vcs)
POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(status time ip background_jobs)

POWERLEVEL9K_SHORTEN_DIR_LENGTH=2

POWERLEVEL9K_TIME_FORMAT="%D{%H:%M}"
POWERLEVEL9K_TIME_BACKGROUND='white'
POWERLEVEL9K_HOME_ICON=''
POWERLEVEL9K_HOME_SUB_ICON=''
POWERLEVEL9K_FOLDER_ICON=''
POWERLEVEL9K_STATUS_VERBOSE=true
POWERLEVEL9K_STATUS_CROSS=true

```

### 第四步：同步 vscode 配置
![vscode字体配置](../assets/vscode%E5%AD%97%E4%BD%93%E9%85%8D%E7%BD%AE.jpg)

### Finish