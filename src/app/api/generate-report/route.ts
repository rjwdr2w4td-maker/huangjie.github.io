import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { batchNo, cropType, variety, storageLocation, testType, elements, testMethod, instrumentModel, tester, testDate, fridgeLocation, result, sender } = await request.json();

    if (!batchNo || !variety || !elements || elements.length === 0) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const elementsDetail = elements
      .map((el: { name: string; ctValue: string; result: string }) => `  - ${el.name}: Ct值=${el.ctValue || "N/A"}, 结果=${el.result}`)
      .join("\n");

    const systemPrompt = `你是一名专业的种子质量检验报告撰写专家。请根据提供的检测数据，严格按照中国农业转基因成分检测报告的规范格式，生成一份《转基因成分检测报告单》。

报告必须包含以下内容，以JSON格式输出：
{
  "reportNo": "报告编号（格式：JYBG+年份+4位流水号）",
  "title": "转基因成分检测报告单",
  "sampleInfo": {
    "batchNo": "批次号",
    "cropType": "作物种类",
    "variety": "品种名称",
    "storageLocation": "存放点",
    "sampleAmount": "样品量（根据取样量填写）"
  },
  "testInfo": {
    "testType": "检测类型",
    "testMethod": "检测方法",
    "instrumentModel": "仪器型号",
    "testStandard": "检测依据标准（如：农业部2031号公告-19-2013）"
  },
  "testElements": [
    {
      "name": "元件名称",
      "ctValue": "Ct值",
      "result": "阴性/阳性",
      "detectionLimit": "检测限"
    }
  ],
  "conclusion": "检测结论（如：样品中未检出CaMV35S启动子、NOS终止子、Bar基因等转基因成分，判定为阴性/阳性）",
  "tester": "检测人",
  "sender": "送样人",
  "reviewer": "审核人（留空待填）",
  "testDate": "检测日期",
  "reportDate": "报告日期（当天日期）",
  "remark": "备注说明"
}

请确保：
1. 报告格式专业规范，符合中国农业转基因检测报告标准
2. 结论要明确：任一元件阳性则整体判定阳性
3. 检测依据标准要引用正确的国家标准或农业部公告
4. 仅输出JSON，不要有其他文字`;

    const userPrompt = `请根据以下检测数据生成转基因成分检测报告单：

批次号：${batchNo}
作物种类：${cropType}
品种名称：${variety}
存放点：${storageLocation || "未填写"}
检测类型：${testType}
检测方法：${testMethod}
仪器型号：${instrumentModel}
送样人：${sender || "未填写"}
检测人：${tester}
检测日期：${testDate}
冰箱位置：${fridgeLocation || "未填写"}

检测元件详情：
${elementsDetail}

最终结论：${result}`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ];

    const response = await client.invoke(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.3,
    });

    let reportData;
    try {
      // Try to parse JSON from the response
      const content = response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reportData = JSON.parse(jsonMatch[0]);
      } else {
        reportData = { rawContent: content };
      }
    } catch {
      reportData = { rawContent: response.content };
    }

    return NextResponse.json({ success: true, data: reportData });
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成报告失败";
    console.error("Generate report error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
