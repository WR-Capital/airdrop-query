# airdrop-query
空投查询脚本集合


# 参数配置

1. 所有参数都配置都在`config.json.js` 文件,根据的需求修改这些配置项。

# 运行查询

1. 在程序目录下的终端运行 `npm run xxx` xxx表示src目录下的脚本文件名，例如，如果脚本文件名是`jupiter`，运行 `npm run jupiter`即可。
2. 程序将开始查询，并将结果保存在 `data/output` 目录下。结果文件的名称将是 `{filename}QueryData.csv`，其中 `{filename}` 是脚本文件名。