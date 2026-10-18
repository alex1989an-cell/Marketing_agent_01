"""Маркетинговый агент на Claude Agent SDK.

Запуск:
    python agent.py "Составь контент-план для Telegram на 2 недели"
    python agent.py            # интерактивный режим (диалог)
"""

import asyncio
import csv
import os
import sys
from datetime import datetime
from pathlib import Path

from claude_agent_sdk import (
    AgentDefinition,
    AssistantMessage,
    ClaudeAgentOptions,
    ClaudeSDKClient,
    ResultMessage,
    TextBlock,
    ToolUseBlock,
    create_sdk_mcp_server,
    tool,
)

ROOT = Path(__file__).parent
OUTPUT = ROOT / "output"
BRAND_FILE = ROOT / "brand.md"
CONTENT_PLAN = OUTPUT / "content_plan.csv"

MODEL = os.getenv("MARKETING_AGENT_MODEL", "claude-opus-5-5")


# ---------- Свой инструмент: запись постов в контент-план (CSV) ----------

@tool(
    "add_to_content_plan",
    "Добавить публикацию в контент-план (output/content_plan.csv). "
    "Вызывай для каждого готового поста.",
    {"date": str, "channel": str, "topic": str, "text": str},
)
async def add_to_content_plan(args: dict) -> dict:
    OUTPUT.mkdir(exist_ok=True)
    is_new = not CONTENT_PLAN.exists()
    with CONTENT_PLAN.open("a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if is_new:
            writer.writerow(["date", "channel", "topic", "text"])
        writer.writerow([args["date"], args["channel"], args["topic"], args["text"]])
    return {"content": [{"type": "text", "text": f"Добавлено: {args['date']} — {args['topic']}"}]}


marketing_tools = create_sdk_mcp_server(name="marketing", tools=[add_to_content_plan])


# ---------- Подагенты: узкие специалисты ----------

SUBAGENTS = {
    "researcher": AgentDefinition(
        description="Исследует рынок, конкурентов и тренды в интернете. "
        "Используй для анализа конкурентов и поиска идей.",
        prompt="Ты маркетинговый аналитик. Ищи факты в интернете, указывай источники "
        "(ссылки). Делай выводы: что конкуренты делают хорошо, где у них слабые места, "
        "какие возможности есть у нашего бренда. Пиши кратко, по пунктам.",
        tools=["WebSearch", "WebFetch", "Read"],
        model="sonnet",
    ),
    "copywriter": AgentDefinition(
        description="Пишет тексты: посты для соцсетей, email-рассылки, рекламные "
        "объявления, тексты для сайта.",
        prompt="Ты сильный копирайтер. Строго соблюдай голос бренда из brand.md. "
        "Пиши живо, конкретно, без штампов и канцелярита. Для каждого текста "
        "предлагай цепляющий заголовок и призыв к действию.",
        tools=["Read", "Write"],
        model="sonnet",
    ),
    "seo": AgentDefinition(
        description="SEO-специалист: ключевые слова, структура статей, мета-теги.",
        prompt="Ты SEO-специалист. Подбирай ключевые запросы под аудиторию, "
        "предлагай структуру статей (H1-H3), title и description.",
        tools=["WebSearch", "WebFetch", "Read", "Write"],
        model="sonnet",
    ),
}


def build_system_prompt() -> str:
    brand = BRAND_FILE.read_text(encoding="utf-8") if BRAND_FILE.exists() else "(бриф не заполнен)"
    today = datetime.now().strftime("%Y-%m-%d")
    return f"""Ты — главный маркетолог-агент. Отвечай на русском языке.

Сегодня: {today}.

Вот бриф бренда, на который ты опираешься во всех задачах:
<brand>
{brand}
</brand>

Как работать:
- Сложные задачи делегируй подагентам: researcher (исследования и конкуренты),
  copywriter (тексты), seo (поисковая оптимизация). Потом собери итог.
- Готовые посты добавляй в контент-план инструментом add_to_content_plan.
- Большие результаты (отчёты, планы, статьи) сохраняй в папку output/ в Markdown.
- Если в брифе не хватает важных данных, сделай разумное допущение и явно его отметь.
- В конце кратко перечисли, что сделано и какие файлы созданы."""


def build_options() -> ClaudeAgentOptions:
    return ClaudeAgentOptions(
        model=MODEL,
        system_prompt=build_system_prompt(),
        cwd=str(ROOT),
        agents=SUBAGENTS,
        mcp_servers={"marketing": marketing_tools},
        # Разрешённые инструменты. Bash не даём — агенту он не нужен.
        allowed_tools=[
            "Read", "Write", "Edit", "Glob",
            "WebSearch", "WebFetch",
            "Task", "Agent",  # делегирование подагентам
            "mcp__marketing__add_to_content_plan",
        ],
        disallowed_tools=["Bash"],
        permission_mode="acceptEdits",  # можно писать файлы без подтверждений
        max_turns=60,
    )


async def print_response(client: ClaudeSDKClient) -> None:
    async for message in client.receive_response():
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    print(block.text, flush=True)
                elif isinstance(block, ToolUseBlock):
                    print(f"  ⚙ {block.name}", flush=True)
        elif isinstance(message, ResultMessage):
            cost = f"${message.total_cost_usd:.3f}" if message.total_cost_usd else "—"
            print(f"\n[готово: шагов {message.num_turns}, стоимость {cost}]\n")


async def main() -> None:
    OUTPUT.mkdir(exist_ok=True)
    task = " ".join(sys.argv[1:]).strip()

    async with ClaudeSDKClient(options=build_options()) as client:
        if task:
            await client.query(task)
            await print_response(client)
            return

        print("Маркетинговый агент. Напишите задачу (пустая строка или 'выход' — завершить).\n")
        while True:
            try:
                task = input("Вы: ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if task.lower() in {"", "выход", "exit", "quit"}:
                break
            await client.query(task)
            await print_response(client)


if __name__ == "__main__":
    asyncio.run(main())
